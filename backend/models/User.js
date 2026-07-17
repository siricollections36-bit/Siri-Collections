const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Security: Does not return password in regular searches
  },
  // Inside User.js userSchema
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { 
  timestamps: true 
});

/**
 * PRE-SAVE HOOK (FIXED)
 * We removed the 'next' parameter because this is an async function.
 * This will stop the "next is not a function" error.
 */
userSchema.pre('save', async function () {
  // Only hash the password if it is new or modified
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error('Password encryption failed');
  }
});

/**
 * HELPER METHOD: Compare Password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * HELPER METHOD: Generate Reset Token
 */
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);