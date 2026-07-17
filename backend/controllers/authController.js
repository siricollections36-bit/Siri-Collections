const User = require('../models/User');
const Order = require('../models/Order'); // 1. Import Order Model
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 2. Create the new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    // 3. SCALABILITY FEATURE: Link guest orders to this new account
    // We find all orders where the email matches but the 'user' field is empty
    const linkedOrders = await Order.updateMany(
      { "customer.email": email.toLowerCase(), "customer.user": null },
      { $set: { "customer.user": user._id } }
    );

    console.log(`Linked ${linkedOrders.modifiedCount} previous guest orders to user: ${email}`);

    // 4. Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ message: "Registration failed. Email might already exist." });
  }
};