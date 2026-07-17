const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

/**
 * MIDDLEWARE
 */
// Enable CORS for frontend communication
app.use(cors());

// Parse JSON bodies (standard API requests)
app.use(express.json());

// Parse URL-encoded bodies (important for some form submissions)
app.use(express.urlencoded({ extended: true }));

/**
 * DATABASE CONNECTION
 * Connects to MongoDB Atlas using the URI from your .env
 */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err.message);
    process.exit(1); // Stop the server if DB connection fails
  });

/**
 * API ROUTES
 */
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('Siri Textiles API is running smoothly...');
});

/**
 * ERROR HANDLING (For Scalability)
 */

// 1. Handle 404 - Route Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: "API Route not found" });
});

// 2. Global Error Handler (Catches all server errors)
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
  console.log(`🔗 Local link: http://localhost:${PORT}`);
});