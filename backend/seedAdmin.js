const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const adminExists = await User.findOne({ email: 'admin@siritextiles.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@siritextiles.com',
      password: 'admin123', // This will be hashed automatically by our model
      role: 'admin'
    });
    console.log("✅ Admin created successfully");
  } else {
    console.log("ℹ️ Admin already exists");
  }
  process.exit();
});