const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes/userRoutes');
const authRoutes = require('./userRoutes/authRoutes');
const customerProfileRoutes = require('./customerProfileRoutes');
const userAddressRoutes = require("./userRoutes/userAddress")
const otpRoutes = require("./userRoutes/otpRoutes")
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Define route paths
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/otp', otpRoutes);
router.use('/adress', userAddressRoutes);


// For protected routes, apply the middleware before using the routes
router.use('/customer-profiles', verifyToken);
// router.use('/customer-profiles', checkRole('admin', 'customer'));
router.use('/customer-profiles', customerProfileRoutes);

// Base route for API health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Welcome to API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
router.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router;