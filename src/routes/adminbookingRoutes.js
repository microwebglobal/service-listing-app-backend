// adminBookingRoutes.js
const express = require('express');
const router = express.Router();
const AdminBookingController = require('../controllers/AdminBookingController');
const { authMiddleware, roleCheck } = require('../middlewares/auth.middleware');

// Apply authentication and admin role check to all routes
router.use(authMiddleware);
router.use(roleCheck('admin'));

// GET all bookings with filters
router.get('/bookings', AdminBookingController.getAllBookings);

// GET single booking details
router.get('/bookings/:id', AdminBookingController.getBookingById);

// PUT assign service provider to booking
router.put('/bookings/:id/assign', AdminBookingController.assignServiceProvider);

// PUT update booking status
router.put('/bookings/:id/status', AdminBookingController.updateBookingStatus);

// GET service providers list
router.get('/service-providers', AdminBookingController.getServiceProviders);

// GET booking analytics
//router.get('/bookings/analytics', AdminBookingController.getBookingAnalytics);

module.exports = router;