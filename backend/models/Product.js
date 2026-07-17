const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  sku: { type: String, unique: true, sparse: true, trim: true },
  category: { type: String, required: true },
  fabric: String,
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [String],
  description: { type: String, default: "" }, // Optional
  stock: { type: Number, default: 0 }, // Internal stock count
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);