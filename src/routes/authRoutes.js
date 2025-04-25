const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// Create an instance of AuthController
const authController = new AuthController();

// Customer Routes
router.post("/customer/login/send-otp", authController.customerSendOTP);
router.post("/customer/login/verify-otp", authController.customerVerifyOTP);

// Admin Routes
router.post("/admin/login", authController.adminLogin);

// Service Provider Routes
router.post("/provider/login", authController.providerLogin);

router.post('/refresh', authController.refreshToken);

// Common Routes
router.post("/logout", authController.logout);
module.exports = router;