const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

const customerProfileRoutes = require('./customerProfileRoutes');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Add other route imports here as needed
// const authRoutes = require('./authRoutes');
// const productRoutes = require('./productRoutes');

// Define route paths
router.use('/users', userRoutes);
router.use('/customer-profiles', customerProfileRoutes);
router.use('/auth', authRoutes);
router.use('/customer-profiles', verifyToken, checkRole('admin', 'customer'), customerProfileRoutes);

// router.use('/auth', authRoutes);
// router.use('/products', productRoutes);

// Base route for API health check
router.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Welcome to API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = router;