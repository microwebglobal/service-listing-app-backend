const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/authController');

// Define authentication routes
router.post('/send-otp', AuthController.sendLoginOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

module.exports = router;