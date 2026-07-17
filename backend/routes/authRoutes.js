const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // Now active

/**
 * 1. SIGNUP
 * Registers user and links previous guest orders by email.
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });

    // Link guest orders automatically for scalability
    await Order.updateMany(
      { "customer.email": email.toLowerCase(), "customer.user": null },
      { $set: { "customer.user": user._id } }
    );

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

/**
 * 2. LOGIN
 * Secure login using hashed password comparison.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // We explicitly select '+password' because it is hidden in the Model
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * 3. FORGOT PASSWORD
 * Generates a unique token and sends a real email to the user.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email address." });
    }

    // Generate reset token from the method we added in User.js
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create the reset URL pointing to your FRONTEND (React)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1a4a34; text-align: center;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your Siri Textiles account. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1a4a34; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset My Password</a>
        </div>
        <p style="font-size: 12px; color: #888;">Note: This link is only valid for 15 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; text-align: center; color: #aaa;">Siri Textiles &copy; 2024</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Secure Password Reset Link - Siri Textiles',
        message,
      });
      
      res.status(200).json({ success: true, message: "A secure reset link has been sent to your inbox." });
    } catch (err) {
      // If email fails, clear the tokens in the database
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error("Email Error:", err);
      return res.status(500).json({ message: "Internal mail server error. Please try again later." });
    }
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * 4. RESET PASSWORD
 * Verifies the token and updates the user's password in MongoDB.
 */
router.put('/reset-password/:token', async (req, res) => {
  try {
    // 1. Hash the token from the URL to compare it with the hashed one in DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Find user with valid token and check if it hasn't expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: "The reset link is invalid or has expired." });
    }

    // 3. Set new password (Mongoose pre-save will hash this automatically)
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: "Your password has been updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;