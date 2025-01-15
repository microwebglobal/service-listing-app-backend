const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Customer Routes
router.post('/customer/login/send-otp', AuthController.customerSendOTP);
router.post('/customer/login/verify-otp', AuthController.customerVerifyOTP);

// Admin Routes
router.post('/admin/login', AuthController.adminLogin);

// Service Provider Routes
router.post('/provider/login', AuthController.providerLogin);

// Common Routes
router.post('/logout', AuthController.logout);

module.exports = router;