const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

/**
 * 1. SIGNUP
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    
    const user = await User.create({ name, email: email.toLowerCase(), password });
    
    await Order.updateMany(
      { "customer.email": email.toLowerCase(), "customer.user": null },
      { $set: { "customer.user": user._id } }
    );

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: "Signup failed" }); }
});

/**
 * 2. LOGIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid email or password" });
    
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: "Login failed" }); }
});

/**
 * 3. FORGOT / RESET PASSWORD (Exactly as you provided)
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `Password Reset Link: ${resetUrl}`;
    try {
      await sendEmail({ email: user.email, subject: 'Password Reset', message });
      res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: "Email error" });
    }
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.put('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

// --- 4. WISHLIST ROUTES ---
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.wishlist);
  } catch (err) { res.status(500).json({ message: "Wishlist fetch failed" }); }
});

router.post('/wishlist/toggle', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.wishlist.indexOf(productId);
    if (index === -1) user.wishlist.push(productId);
    else user.wishlist.splice(index, 1);
    
    await user.save();
    res.status(200).json(user.wishlist);
  } catch (err) { res.status(500).json({ message: "Wishlist toggle failed" }); }
});

// --- 5. CART ROUTES ---
router.get('/cart/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.cart || []);
  } catch (err) { res.status(500).json({ message: "Cart fetch failed" }); }
});

router.post('/cart/sync', async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.cart = cartItems;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) { res.status(500).json({ message: "Cart sync failed" }); }
});

module.exports = router;