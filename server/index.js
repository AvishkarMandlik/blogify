const express = require('express');
const mongoConnection = require('./mongoConn');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 5000;
const path = require('path');
app.use(express.json());

app.post('/signup', async (req, res) => {
  const { username,email, password,role } = req.body;
  const usersCollection = mongoConnection.getCollection('users');

  const existingUsername = await usersCollection.findOne({ email});
  if (existingUsername) {
    return res.json({
      success: false,
      message: "Email already exists"
  })
  }
  const existingEmail = await usersCollection.findOne({ username});
  if (existingEmail) {
    return res.json({
      success: false,
      message: "Username already exists"
  })
}
  const hashedPassword = await bcrypt.hash(password, 10);
  await usersCollection.insertOne({ username,email, role, password: hashedPassword });
  const savedUser =  { username,email, role, password: hashedPassword }
    res.json({
      success: true,
      message: "User created successfully",
      data: savedUser
  })});


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
  
    res.json({
      success: true,
      message: "Logged in successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });

  app.post("/createBlogs", async(req,res)=>{
    const {title, imgUrl, description, category, content, author} = req.body;
    const blogsCollection = mongoConnection.getCollection('blogs');
    const existingBlog = await blogsCollection.findOne({title});
    if(existingBlog){
      return res.json({ message: 'Blog already exists' });
  
    }
    const savedBlog = await blogsCollection.insertOne({title, imgUrl, description, category, author, content });

    res.json({
      success: true,
      message: "BLOG added successfully"
    });
  })

  app.post("/BlogContent", async(req,res)=>{
    const {title} = req.body;
    const blogsCollection = mongoConnection.getCollection('blogs');
    const Blog = await blogsCollection.findOne({title});
    res.json(Blog)
  })
  
  app.get("/allBlogs", async(req, res)=>{
    const blogsCollection = mongoConnection.getCollection('blogs');
    const allBlogs = await blogsCollection.find({}).toArray();

    res.json({
        success: true,
        message: "All Blogs fetched successfully",
        data: allBlogs
    })
})

app.get('/Blogsbytitle', async (req, res) => {
  const blogsCollection = mongoConnection.getCollection('blogs');
  const title = req.query.title;

  const titleRegex = new RegExp(title, 'i');

  const foundBlog = await blogsCollection.find({ title: titleRegex }).toArray();

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
