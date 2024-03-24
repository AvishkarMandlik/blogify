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

  const existingUser = await usersCollection.findOne({ email});
  if (existingUser) {
    return res.json({
      success: false,
      message: "Email already exists"
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
