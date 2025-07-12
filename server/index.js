const express = require('express');
const mongoConnection = require('./mongoConn');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const app = express();
const PORT = 5000;
const path = require('path');

const { ObjectId } = require('mongodb');
const protect = require('./middleware/protect');
const { sendVerificationEmail } = require('./utils/emailService');
app.use(express.json());
app.use(cors());

// app.post('/signup', async (req, res) => {
//   const { username, email, password, role } = req.body;
//   const usersCollection = mongoConnection.getCollection('users');

//   const existingEmail = await usersCollection.findOne({ email });
//   if (existingEmail) {
//     return res.json({
//       success: false,
//       message: "Email already exists"
//     });
//   }

//   const existingUsername = await usersCollection.findOne({ username });
//   if (existingUsername) {
//     return res.json({
//       success: false,
//       message: "Username already exists"
//     });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const savedUser = { username, email, role, password: hashedPassword, joinedAt: new Date() }
//   const token = jwt.sign(savedUser, process.env.JWT_SECRET);
//   await usersCollection.insertOne({ ...savedUser });

//   res.json({
//     success: true,
//     message: "User created successfully",
//     data: token
//   })
// });


function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

app.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;
  const usersCollection = mongoConnection.getCollection("users");

  const existingUser = await usersCollection.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      return res.json({ success: false, message: "Email already exists" });
    } else {
      // 👇 Email exists but not verified: resend OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const hashedPassword = await bcrypt.hash(password, 10);

      await usersCollection.updateOne(
        { email },
        {
          $set: {
            username,
            password: hashedPassword,
            role,
            otp,
            otpExpiry,
            joinedAt: new Date(),
            isVerified: false,
          },
        }
      );

      const html = `
        <h2>Welcome back to Blogify, ${username}!</h2>
        <p>Your new OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `;

      await sendVerificationEmail(email, "Your new Blogify OTP", html);

      return res.json({
        success: true,
        message:
          "Account already exists but not verified. A new OTP has been sent to your email.",
      });
    }
  }

  // 👇 First-time signup
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const newUser = {
    username,
    email,
    role,
    password: hashedPassword,
    isVerified: false,
    otp,
    otpExpiry,
    joinedAt: new Date(),
  };

  await usersCollection.insertOne(newUser);

  const html = `
    <h2>Welcome to Blogify, ${username}!</h2>
    <p>Your OTP for email verification is:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 10 minutes.</p>
  `;

  await sendVerificationEmail(email, "Your Blogify OTP", html);

  res.json({
    success: true,
    message: "User created successfully. OTP sent to your email.",
  });
});

app.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const usersCollection = mongoConnection.getCollection("users");
  const user = await usersCollection.findOne({ email });

  if (!user || user.isVerified) {
    return res.json({
      success: false,
      message: "Invalid user or already verified.",
    });
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await usersCollection.updateOne({ email }, { $set: { otp, otpExpiry } });

  const html = `<h2>Your Blogify OTP:</h2><h3>${otp}</h3><p>Valid for 10 minutes.</p>`;
  await sendVerificationEmail(email, "Resent OTP - Blogify", html);

  res.json({ success: true, message: "OTP resent successfully." });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const usersCollection = mongoConnection.getCollection("users");
  const user = await usersCollection.findOne({ email });

  if (!user) return res.json({ success: false, message: "User not found." });
  if (user.isVerified)
    return res.json({ success: false, message: "User already verified." });
  if (user.otp !== parseInt(otp) || new Date() > new Date(user.otpExpiry)) {
    return res.json({ success: false, message: "Invalid or expired OTP." });
  }

  await usersCollection.updateOne(
    { email },
    { $set: { isVerified: true }, $unset: { otp: "", otpExpiry: "" } }
  );

  return res.json({ success: true, message: "Email verified successfully!" });
});


app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const usersCollection = mongoConnection.getCollection('users');

  let user;
  if (username) {
    user = await usersCollection.findOne({ username });
  } else if (email) {
    user = await usersCollection.findOne({ email });
  }

  if (!user) {
    return res.json({
      success: false,
      message: "Incorrect email or username",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.json({
      success: false,
      message: "Incorrect password",
    });
  }

  if (!user.isVerified) {
  return res.json({
    success: false,
    message: "Email not verified. Please check your inbox.",
  });
}


  const token = jwt.sign({ id: user._id, role: user.role, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' });

  res.json({
    success: true,
    message: "Logged in successfully",
    data: {
      token,
    },
  });
});

// Send OTP
app.post('/send-reset-otp', async (req, res) => {
  const { email } = req.body;
  const users = mongoConnection.getCollection('users');

  const user = await users.findOne({ email });
  if (!user) return res.json({ success: false, message: "Email not registered" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await users.updateOne({ email }, { $set: { resetOtp: otp, resetOtpExpiry: otpExpiry } });

  await sendVerificationEmail(email, "Your Blogify Password Reset OTP", `
    <h2>Forgot Password</h2>
    <p>Your OTP is <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes.</p>
  `);

  res.json({ success: true, message: "OTP sent to your email" });
});

// Verify OTP & Reset Password
app.post('/verify-reset-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const users = mongoConnection.getCollection('users');

  const user = await users.findOne({ email });
  if (!user || user.resetOtp !== otp || new Date(user.resetOtpExpiry) < new Date()) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await users.updateOne(
    { email },
    { $set: { password: hashedPassword }, $unset: { resetOtp: "", resetOtpExpiry: "" } }
  );

  res.json({ success: true, message: "Password reset successfully" });
});



app.get('/userProfile', protect, async (req, res) => {
  const userId = req.user.id; // decoded from token
  try {
    const usersCollection = mongoConnection.getCollection('users');
    const blogsCollection = mongoConnection.getCollection('blogs');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const blogsCount = await blogsCollection.countDocuments({ author: user.username });
    const savedBlogsCount = user.savedBlogs?.length || 0;

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joinDate: user._id.getTimestamp(),
        blogsCount,
        savedBlogsCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.delete('/deleteAccount', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  const usersCollection = mongoConnection.getCollection('users');
  const user = await usersCollection.findOne({ email, password: { $exists: true } });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }
  await usersCollection.deleteOne({ email });
  res.json({ success: true, message: "Account deleted successfully" });
});


app.get('/myBlogs', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  try {
    const blogsCollection = mongoConnection.getCollection('blogs');
    const usersCollection = mongoConnection.getCollection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const userBlogs = await blogsCollection.find({ author: user.username }).toArray(); // Assuming 'author' stores username

    // Enrich with like/save status for the current user
    const savedBlogIds = user?.savedBlogs?.map(id => id.toString()) || [];
    const enrichedUserBlogs = userBlogs.map(blog => ({
      ...blog,
      isLiked: blog.likes?.includes(userId) || false,
      isSaved: savedBlogIds.includes(blog._id.toString())
    }));

    res.json({
      success: true,
      message: "User's blogs fetched successfully",
      data: enrichedUserBlogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.post("/createBlogs", async (req, res) => {
  const { title, imgUrl, description, category, content, author } = req.body;
  const blogsCollection = mongoConnection.getCollection('blogs');
  const existingBlog = await blogsCollection.findOne({ title });
  if (existingBlog) {
    return res.json({ message: 'Blog already exists' });

  }
  const savedBlog = await blogsCollection.insertOne({ title, imgUrl, description, category, author, content, createdAt: new Date() });

  res.json({
    success: true,
    message: "BLOG added successfully"
  });
})

app.post("/BlogContent", async (req, res) => {
  const { blogId } = req.body;
  const blogsCollection = mongoConnection.getCollection("blogs");

  try {
    const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/summarizeBlog", async (req, res) => {
  const { content = "" } = req.body;
  if (!content.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "No content sent." });
  }

  try {
    const geminiURL =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    const aiRes = await axios.post(
      `${geminiURL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
                      Summarize the following blog in **simple, everyday English**.
                      • Use 6‑10 concise sentences.
                      • Keep important facts, skip fluff.
                      • Do NOT add anything that is not in the text.

                      BLOG START
                      ${content}
                      BLOG END`,
              },
            ],
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const summary =
      aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Summary unavailable.";

    res.json({ success: true, summary });
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error?.message ||
      err.message ||
      "Gemini API failed to summarize content.";
    console.error("Gemini summarization error:", err.message);
    res.status(500).json({
      success: false,
      message: message
    });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const blogCollection = mongoConnection.getCollection('blogs');

    const allCategories = await blogCollection.distinct("category");

    res.json({
      success: true,
      message: "Categories fetched from blogs",
      data: allCategories.filter(c => !!c)  // removes null/undefined/empty
    });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
});

app.get("/allBlogs", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.json({ success: false, message: "Missing userId in query" });
  }

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid userId format" });
  }

  const blogsCollection = mongoConnection.getCollection('blogs');
  const usersCollection = mongoConnection.getCollection('users');

  const allBlogs = await blogsCollection.find({}).toArray();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  const savedBlogIds = user?.savedBlogs?.map(id => id.toString()) || [];

  const enrichedBlogs = allBlogs.map(blog => {
    return {
      ...blog,
      isLiked: blog.likes?.includes(userId) || false,
      isSaved: savedBlogIds.includes(blog._id.toString())
    };
  });

  res.json({
    success: true,
    message: "All Blogs fetched successfully",
    data: enrichedBlogs
  });
});

app.delete('/deleteBlog', async (req, res) => {
  const blogsCollection = mongoConnection.getCollection('blogs');
  const title = req.query.title;


  const foundBlog = await blogsCollection.deleteOne({ title: title });

  if (foundBlog) {
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } else {
    res.json({
      success: false,
      message: 'No blog found for this user'
    });
  }
});

app.put('/updateBlog', async (req, res) => {
  const blogsCollection = mongoConnection.getCollection('blogs');

  const title = req.query.title;
  const imgUrl = req.query.imgUrl;
  const description = req.query.description;
  const category = req.query.category;
  const content = req.query.content;

  const foundBlog = await blogsCollection.updateOne({ title: title }, { $set: { imgUrl: imgUrl, description: description, category: category, content: content } });

  if (foundBlog) {
    res.json({
      success: true,
      message: 'Blog updated successfully'
    });
  } else {
    res.json({
      success: false,
      message: 'No blog found for this user'
    });
  }
});


app.post("/likeBlog", async (req, res) => {
  const { blogId, userId } = req.body;
  const blogsCollection = mongoConnection.getCollection('blogs');

  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  if (!blog) {
    return res.json({ success: false, message: "Blog not found" });
  }

  if (blog.likes && blog.likes.includes(userId)) {
    return res.json({ message: "You already liked this blog" });
  }

  const updatedBlog = await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $addToSet: { likes: userId } }
  );

  res.json({ success: true, message: "Blog liked successfully" });
});

app.post("/unlikeBlog", async (req, res) => {
  const { blogId, userId } = req.body;
  const blogsCollection = mongoConnection.getCollection('blogs');

  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  if (!blog) {
    return res.json({ success: false, message: "Blog not found" });
  }

  await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $pull: { likes: userId } }
  );

  res.json({ success: true, message: "Blog unliked successfully" });
});

app.get("/likeCount", async (req, res) => {
  const { blogId } = req.query;
  const blogsCollection = mongoConnection.getCollection('blogs');
  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  const likeCount = blog.likes?.length || 0;
  res.json({
    success: true,
    message: "Like count fetched successfully",
    data: likeCount
  });
})


app.post('/addComment', async (req, res) => {
  const { blogId, userId, comment } = req.body;

  if (!blogId || !userId || !comment) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const blogsCollection = mongoConnection.getCollection('blogs');
  const usersCollection = mongoConnection.getCollection('users');

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const newComment = {
    commentId: new ObjectId(),
    userId,
    username: user.username,
    comment,
    createdAt: new Date()
  };

  await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $push: { comments: newComment } }
  );

  res.json({ success: true, message: "Comment added successfully", comment: newComment });
});

app.put("/editComment", async (req, res) => {
  const { commentId, newComment, userId } = req.body;
  const blogsCollection = mongoConnection.getCollection("blogs");

  const result = await blogsCollection.updateOne(
    { "comments.commentId": new ObjectId(commentId), "comments.userId": userId },
    { $set: { "comments.$.comment": newComment } }
  );

  if (result.modifiedCount) {
    res.json({ success: true, message: "Comment updated" });
  } else {
    res.status(403).json({ success: false, message: "Edit not permitted" });
  }
});

app.delete('/deleteComment', async (req, res) => {
  const { blogId, commentId, userId } = req.query;

  if (!blogId || !commentId || !userId) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const blogsCollection = mongoConnection.getCollection('blogs');
  const usersCollection = mongoConnection.getCollection('users');

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

  const comment = blog.comments?.find(c => c.commentId.toString() === commentId);

  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  // Allow only author or admin
  if (comment.userId !== userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $pull: { comments: { commentId: new ObjectId(commentId) } } }
  );

  res.json({ success: true, message: "Comment deleted successfully" });
});

app.get('/comments', async (req, res) => {
  const { blogId } = req.query;

  if (!blogId) {
    return res.status(400).json({ success: false, message: "Missing blogId" });
  }

  const blogsCollection = mongoConnection.getCollection('blogs');
  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });

  if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

  res.json({ success: true, comments: blog.comments || [] });
});

app.get('/commentCount', async (req, res) => {
  const { blogId } = req.query;

  if (!blogId) return res.status(400).json({ success: false, message: "Missing blogId" });

  const blogsCollection = mongoConnection.getCollection('blogs');
  const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });

  const count = blog?.comments?.length || 0;

  res.json({ success: true, count });
});


app.post("/saveBlog", async (req, res) => {
  const { blogId, userId } = req.body;
  const usersCollection = mongoConnection.getCollection('users');
  const blogsCollection = mongoConnection.getCollection('blogs');

  if (!ObjectId.isValid(blogId) || !ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid IDs" });
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Save blog in user's savedBlogs array
  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { savedBlogs: new ObjectId(blogId) } }
  );

  // Find all users who saved this blog
  const savedUsers = await usersCollection
    .find({ savedBlogs: new ObjectId(blogId) })
    .project({ _id: 1, username: 1 })
    .toArray();

  res.json({
    success: true,
    message: "Blog saved successfully",
    saveCount: savedUsers.length,
    savedBy: savedUsers  // [{ _id, username }]
  });
});

app.post("/unsaveBlog", async (req, res) => {
  const { blogId, userId } = req.body;
  const usersCollection = mongoConnection.getCollection('users');

  if (!ObjectId.isValid(blogId) || !ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "Invalid blogId or userId" });
  }

  // Remove blog from savedBlogs array
  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { savedBlogs: new ObjectId(blogId) } }
  );

  // Recount how many users have saved it
  const savedUsers = await usersCollection
    .find({ savedBlogs: new ObjectId(blogId) })
    .project({ _id: 1, username: 1 })
    .toArray();

  res.json({
    success: true,
    message: "Blog unsaved successfully",
    saveCount: savedUsers.length,
    savedBy: savedUsers
  });
});

app.get('/savedBlogs', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const usersCollection = mongoConnection.getCollection('users');
    const blogsCollection = mongoConnection.getCollection('blogs');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const savedBlogIds = user.savedBlogs || [];
    const savedBlogs = await blogsCollection.find({
      _id: { $in: savedBlogIds }
    }).toArray();

    res.json({ success: true, data: savedBlogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/Blogsbytitle', async (req, res) => {
  const blogsCollection = mongoConnection.getCollection('blogs');
  const title = req.query.title;

  const regex = new RegExp(title, 'i');
  const foundBlog = await blogsCollection.find({ title: { $regex: regex } }).toArray();

  if (foundBlog) {
    res.json({
      success: true,
      message: 'Blog fetched successfully',
      data: foundBlog,
    });
  } else {
    res.json({
      success: false,
      message: 'No blog found for this title',
      data: null,
    });
  }
});

app.get('/BlogsbyUsername', async (req, res) => {
  const blogsCollection = mongoConnection.getCollection('blogs');
  const Username = req.query.username;


  const foundBlog = await blogsCollection.find({ author: Username }).toArray();

  if (foundBlog) {
    res.json({
      success: true,
      message: 'Blog fetched successfully',
      data: foundBlog,
    });
  } else {
    res.json({
      success: false,
      message: 'No blog found for this user',
      data: null,
    });
  }
});



app.get("/admin/users", async (_, res) => {
  const users = await mongoConnection
    .getCollection("users")
    .find({}, { projection: { password: 0 } })
    .toArray();
  res.json({ success: true, data: users, message: "Users fetched successfully" });
});

app.delete("/admin/deleteUser", async (req, res) => {
  const { adminEmail, password, targetEmail } = req.body;

  const users = mongoConnection.getCollection("users");
  const blogs = mongoConnection.getCollection("blogs");

  const admin = await users.findOne({ email: adminEmail });
  if (!admin || admin.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only." });

  const ok = await bcrypt.compare(password, admin.password);   // <‑‑ hashed pwd
  if (!ok)
    return res.status(401).json({ success: false, message: "Wrong password." });

  const target = await users.findOne({ email: targetEmail });
  if (!target)
    return res.status(404).json({ success: false, message: "User not found." });

  await users.deleteOne({ _id: target._id });
  await blogs.deleteMany({ author: target.username });

  res.json({ success: true, message: "User & blogs deleted." });
});

app.put("/admin/updateRole", async (req, res) => {
  const { adminEmail, password, targetId, newRole } = req.body;

  const users = mongoConnection.getCollection("users");

  const admin = await users.findOne({ email: adminEmail });
  if (!admin || admin.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only." });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok)
    return res.status(401).json({ success: false, message: "Wrong password." });

  await users.updateOne(
    { _id: new ObjectId(targetId) },
    { $set: { role: newRole } }
  );

  res.json({ success: true, message: "Role updated." });
});

app.get("/likedBlogs", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, message: "userId missing" });

  const blogs = await mongoConnection.getCollection("blogs")
    .find({ likes: userId }).toArray();
  res.json({ success: true, data: blogs });
});

app.get("/dashboardStats", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

  const blogsCollection = mongoConnection.getCollection("blogs");
  const usersCollection = mongoConnection.getCollection("users");

  const totalUsers = await usersCollection.countDocuments();
  const totalBlogs = await blogsCollection.countDocuments();

  const mostLikedBlogs = await blogsCollection
    .find({ likes: { $exists: true, $ne: [] } })
    .sort({ "likes.length": -1 })
    .limit(1)
    .toArray();

  res.json({
    success: true,
    data: { totalUsers, totalBlogs, mostLikedBlogs },
  });
});


app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'))
});

mongoConnection.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
