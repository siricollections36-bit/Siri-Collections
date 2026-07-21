const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product'); // Added missing import
const Settings = require('../models/Settings');

/**
 * 1. DASHBOARD STATISTICS
 * Fetches total counts for the main dashboard cards.
 */
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalProducts] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
    ]);

    res.json({
      totalOrders,
      totalCustomers,
      totalProducts
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

/**
 * 2. CUSTOMER MANAGEMENT
 * Fetches all registered customers and calculates their individual order counts.
 */
router.get('/customers', async (req, res) => {
  try {
    // Get all users with 'customer' role, exclude passwords
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Calculate order counts for each customer based on their email
    const customersWithOrders = await Promise.all(customers.map(async (user) => {
      const orderCount = await Order.countDocuments({ "customer.email": user.email.toLowerCase() });
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalOrders: orderCount,
        joinedDate: user.createdAt
      };
    }));

    res.json(customersWithOrders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customer list" });
  }
});

/**
 * 3. STORE SETTINGS (GET)
 * Publicly accessible for Footer and Contact page info.
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    // Return empty object if no settings exist yet, prevents frontend crash
    res.json(settings || {
        storeName: "Siri Textiles",
        storeEmail: "",
        phone: "",
        address: "",
        instagram: "",
        youtube: ""
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching settings" });
  }
});

/**
 * 4. STORE SETTINGS (UPDATE)
 * Uses 'upsert' to create settings if they don't exist yet.
 */
router.put('/settings', async (req, res) => {
  try {
    // Logic: findOneAndUpdate with empty filter {} matches the first document
    const settings = await Settings.findOneAndUpdate({}, req.body, {
      upsert: true, // Create if not found
      new: true,    // Return the updated document
      runValidators: true
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error("Settings Update Error:", err.message);
    res.status(400).json({ message: "Failed to update settings" });
  }
});

/**
 * 5. WISHLIST MANAGEMENT
 * Note: While these use userId, they are included here as per your request.
 */
router.get('/wishlist/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    res.json(user ? user.wishlist : []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlist" });
  }
});

router.post('/wishlist/toggle', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.json({ success: true, isWishlisted: !isWishlisted });
  } catch (err) {
    res.status(500).json({ message: "Wishlist toggle failed" });
  }
});

module.exports = router;