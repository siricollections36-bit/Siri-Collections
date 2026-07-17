const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;

/**
 * HELPER: Slugify Name
 * Converts "Silk Saree" to "silk-saree-abc12" to ensure unique, SEO-friendly URLs.
 */
const slugify = (text) => {
  const base = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
};

/**
 * 1. GET ALL PRODUCTS (Advanced Filtering, Search & Pagination)
 * This handles the logic for the Shop page and Home page sections.
 */
router.get('/', async (req, res) => {
  try {
    const { 
      category, fabric, minPrice, maxPrice, 
      search, sort, page = 1, limit = 12, 
      isBestSeller, isNewArrival 
    } = req.query;

    let query = {};

    // CATEGORY FILTER: Supports multi-select (e.g., ?category=Silk,Cotton)
    if (category) {
      query.category = { $in: category.split(',') };
    }

    // FABRIC FILTER: Supports multi-select
    if (fabric) {
      query.fabric = { $in: fabric.split(',') };
    }
    
    // PRICE RANGE FILTER: Converts strings to Numbers for MongoDB comparison
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // SEARCH LOGIC: Case-insensitive search on Name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // HOME PAGE FLAGS: Handles both Boolean and String "true"
    if (isBestSeller) query.isBestSeller = String(isBestSeller) === 'true';
    if (isNewArrival) query.isNewArrival = String(isNewArrival) === 'true';

    // SORTING LOGIC
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price-low') sortBy = { price: 1 };
    if (sort === 'price-high') sortBy = { price: -1 };
    if (sort === 'rating') sortBy = { rating: -1 };

    // PAGINATION LOGIC
    const p = Number(page);
    const l = Number(limit);
    const skip = (p - 1) * l;
    
    const products = await Product.find(query)
      .sort(sortBy)
      .limit(l)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: p,
      totalPages: Math.ceil(total / l),
      totalProducts: total
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

/**
 * 2. GET SINGLE PRODUCT BY ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Invalid ID format" });
  }
});

/**
 * 3. CREATE NEW PRODUCT (POST)
 */
router.post('/add', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image." });
    }

    const imageUrls = req.files.map(file => file.path);
    
    // SKU Logic: set to undefined if empty so the 'sparse' unique index works
    const skuValue = req.body.sku && req.body.sku.trim() !== "" ? req.body.sku.trim() : undefined;

    const newProduct = new Product({
      ...req.body,
      sku: skuValue,
      images: imageUrls,
      slug: slugify(req.body.name),
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      stock: Number(req.body.stock) || 0,
      description: req.body.description || "",
      isBestSeller: String(req.body.isBestSeller) === 'true',
      isNewArrival: String(req.body.isNewArrival) === 'true'
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ 
        message: field === 'sku' ? "This SKU already exists." : "Product name is already used." 
      });
    }
    res.status(400).json({ message: err.message });
  }
});

/**
 * 4. UPDATE PRODUCT (PUT)
 */
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Update images only if new ones are uploaded
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    }

    // Ensure numeric and boolean fields are correctly typed
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.originalPrice) updateData.originalPrice = Number(req.body.originalPrice);
    if (req.body.stock) updateData.stock = Number(req.body.stock);
    
    if (req.body.isBestSeller !== undefined) updateData.isBestSeller = String(req.body.isBestSeller) === 'true';
    if (req.body.isNewArrival !== undefined) updateData.isNewArrival = String(req.body.isNewArrival) === 'true';
    
    // Allow clearing SKU
    if (updateData.sku === "") updateData.sku = undefined;
    
    // Update slug if name changed
    if (req.body.name) updateData.slug = slugify(req.body.name);

    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, product: updated });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: "Duplicate SKU or Name detected." });
    }
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

/**
 * 5. DELETE PRODUCT (WITH CLOUDINARY SYNC)
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Step 1: Remove images from Cloudinary storage
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(url => {
        // Robust publicId extraction using regex
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\./);
        const publicId = match ? match[1] : null;
        return publicId ? cloudinary.uploader.destroy(publicId) : null;
      });
      await Promise.all(deletePromises);
    }

    // Step 2: Remove data from MongoDB
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product and photos deleted." });
  } catch (err) {
    res.status(500).json({ message: "Delete operation failed" });
  }
});

module.exports = router;