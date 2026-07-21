const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * HELPER: Atomic Stock Deduction
 */
const updateStock = async (items) => {
  const promises = items.map(item => {
    return Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }, 
      { returnDocument: 'after', runValidators: true }
    );
  });
  await Promise.all(promises);
};

/**
 * 1. INITIATE ORDER (Public)
 */
router.post('/create', async (req, res) => {
  try {
    const { amount, shippingData, items, userId } = req.body;
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Please adjust your cart.` 
        });
      }
    }
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
    const orderNumber = `ST-${Date.now().toString().slice(-8)}`;
    const newOrder = new Order({
      orderNumber,
      customer: {
        user: userId || null,
        name: shippingData.name,
        email: shippingData.email.toLowerCase(),
        phone: shippingData.phone
      },
      shippingAddress: shippingData,
      items,
      totalAmount: amount,
      razorpayOrderId: rzpOrder.id,
      paymentStatus: 'Pending',
      orderStatus: 'Processing'
    });
    await newOrder.save();
    res.status(201).json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, orderNumber });
  } catch (err) {
    res.status(500).json({ message: "Gateway error" });
  }
});

/**
 * 2. VERIFY PAYMENT (Public)
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (!order) return res.status(404).json({ message: "Order not found" });
      order.paymentStatus = 'Paid';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();
      await updateStock(order.items);
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Signature verification failed" });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/**
 * 3. GET ALL ORDERS (Admin Only)
 * Updated to return total counts even for dashboard view
 */
router.get('/', async (req, res) => {
  try {
    const isDashboard = req.query.dashboard === 'true';

    // FIX: Always get the total count for the Dashboard tiles
    const totalOrdersCount = await Order.countDocuments();

    if (isDashboard) {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
      return res.status(200).json({ 
        orders, 
        totalOrders: totalOrdersCount 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8; 
    const tab = req.query.tab || 'new';
    const skip = (page - 1) * limit;

    const processingQuery = { orderStatus: { $regex: /^processing$/i } };
    const existingQuery = { orderStatus: { $not: { $regex: /^processing$/i } } };

    let filter = tab === 'new' ? processingQuery : existingQuery;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalInTab = await Order.countDocuments(filter);
    const newCount = await Order.countDocuments(processingQuery);
    const existingCount = await Order.countDocuments(existingQuery);

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalInTab / limit),
      currentPage: page,
      newCount,
      existingCount,
      totalOrders: totalOrdersCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * 4. GET MY ORDERS (User Profile Page)
 */
router.get('/my-orders/:email', async (req, res) => {
  try {
    const orders = await Order.find({ 
      "customer.email": req.params.email.toLowerCase(),
      paymentStatus: 'Paid'
    }).sort({ createdAt: -1 });
    res.status(200).json(orders);
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
      { returnDocument: 'after' } 
    );
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

/**
 * 6. DELETE ORDER (Admin Only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;