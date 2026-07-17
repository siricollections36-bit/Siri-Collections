const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "" },
  storeEmail: { type: String, default: "" },
  phone: { type: String, default: "" },      // Matches the screenshot
  address: { type: String, default: "" },    // Matches the screenshot
  instagram: { type: String, default: "" },  // Matches the screenshot
  youtube: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);