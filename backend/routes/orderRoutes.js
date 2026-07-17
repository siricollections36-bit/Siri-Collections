const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay with credentials from .env
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * HELPER: Atomic Stock Deduction
 * Prevents "Race Conditions" where two people buy the same last item.
 */
const updateStock = async (items) => {
  const promises = items.map(item => {
    return Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }, 
      { new: true, runValidators: true }
    );
  });
  await Promise.all(promises);
};

/**
 * 1. INITIATE ORDER (Public)
 * Validates stock and creates a Razorpay Order.
 */
router.post('/create', async (req, res) => {
  try {
    const { amount, shippingData, items, userId } = req.body;

    // SCALABILITY CHECK: Verify stock before creating RZP order
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Please adjust your cart.` 
        });
      }
    }

    // Create Razorpay order (Amount in paise)
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    const orderNumber = `ST-${Date.now().toString().slice(-8)}`;

    const newOrder = new Order({
      orderNumber,
      customer: {
        user: userId || null, // null = Guest Checkout
        name: shippingData.name,
        email: shippingData.email.toLowerCase(),
        phone: shippingData.phone
      },
      shippingAddress: {
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state,
        pincode: shippingData.pincode
      },
      items,
      totalAmount: amount,
      razorpayOrderId: rzpOrder.id,
      paymentStatus: 'Pending',
      orderStatus: 'Processing'
    });

    await newOrder.save();

    res.status(201).json({ 
      razorpayOrderId: rzpOrder.id, 
      amount: rzpOrder.amount, 
      orderNumber 
    });
    
  } catch (err) {
    console.error("RZP Create Error:", err);
    res.status(500).json({ message: "Payment gateway initialization failed" });
  }
});

/**
 * 2. VERIFY PAYMENT (Public)
 * Validates signature and triggers stock deduction.
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Security check: Match signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Find the pending order first
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      
      if (!order) return res.status(404).json({ message: "Order not found" });

      // 1. Mark Order as Paid
      order.paymentStatus = 'Paid';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      // 2. SCALABILITY: Deduct stock atomically
      await updateStock(order.items);

      // 3. (Future) Trigger order confirmation email here

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Signature verification failed" });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * 3. GET ALL ORDERS (Admin Only)
 */
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * 4. GET MY ORDERS (User Profile Page)
 * Filters by email to show linked guest orders + account orders
 */
router.get('/my-orders/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 
      "customer.email": req.params.email.toLowerCase(),
      paymentStatus: 'Paid' // Users only want to see successful purchases
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order history" });
  }
});

/**
 * 5. UPDATE STATUS (Admin Only)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { orderStatus: status }, 
      { new: true }
    );
    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

/**
 * 6. DELETE ORDER (Admin Only)
 */
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order removed from database" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

/**
 * GET SINGLE ORDER BY ID
 * URL: http://localhost:5000/api/orders/:id
 */
router.get('/:id', async (req, res) => {
  try {
    // Find order in MongoDB by its _id
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found in database" });
    }
    
    res.json(order);
  } catch (err) {
    // This handles cases where the ID format is wrong
    res.status(500).json({ message: "Invalid Order ID format" });
  }
});

module.exports = router;