const express = require('express');
const router = express.Router();
const OTPController = require('../../controllers/otpController.js');

// Route to send OTP
router.post('/send-otp', OTPController.sendOTP);

// Route to verify OTP
router.post('/verify-otp', OTPController.verifyOTP);

module.exports = router;