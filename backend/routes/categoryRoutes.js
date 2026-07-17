const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const upload = require('../config/cloudinary'); // Ensure this points to your cloudinary config

// @route   POST /api/categories/add
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;

    console.log("--- Received Category Upload Request ---");
    console.log("Name:", name);
    console.log("File:", req.file); // This should show the Cloudinary info

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    // Check for duplicate category name
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    const newCategory = new Category({
      name,
      image: req.file.path, // This is the URL Cloudinary generated
      slug: name.toLowerCase().split(' ').join('-')
    });

    await newCategory.save();
    console.log("✅ Category saved to MongoDB:", newCategory.name);

    res.status(201).json({ success: true, category: newCategory });

  } catch (err) {
    console.error("❌ BACKEND ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Category deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

module.exports = router;