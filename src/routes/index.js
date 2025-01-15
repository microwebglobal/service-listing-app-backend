// routes/index.js
const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./userRoutes/userRoutes");
const cityRoutes = require("./cityRoutes");
const customerProfileRoutes = require("./customerProfileRoutes");
const userAddressRoutes = require("./userRoutes/userAddress");
const otpRoutes = require("./userRoutes/otpRoutes");
const ServiceManagement = require("./serviceManagement");
const PackageRoutes = require("./packageRoutes");
const ServiceProviderRoutes = require("./serviceProviderRoutes");
const BookingRoutes = require("./bookingRoutes");
const AuthRoutes = require("./authRoutes")
// Import middlewares
const { verifyToken, checkRole } = require("../middlewares/auth.middleware");

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
    version: process.env.API_VERSION || "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Auth related routes (public)
router.use("/otp", otpRoutes);
router.use("/", cityRoutes);
// User related routes
router.use("/users", userRoutes);
router.use("/users/address", userAddressRoutes); // User address routes
router.use("/", ServiceProviderRoutes);
// Service related routes
router.use("/", ServiceManagement);
router.use("/", PackageRoutes);
router.use("/", BookingRoutes);
router.use("/auth", AuthRoutes);

// Protected routes
router.use(
  "/customer-profiles",
  [
    verifyToken,
    // checkRole(['admin', 'customer']), // Uncomment when role check is needed
  ],
  customerProfileRoutes
);

// Redirect root to API documentation or health check
router.get("/", (req, res) => {
  res.redirect("/api/health");
});

// 404 handler for undefined routes
router.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
});

module.exports = router;
