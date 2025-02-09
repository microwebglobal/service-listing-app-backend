const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Cart Management Routes
router.post("/cart/add", authMiddleware, BookingController.addToCart);
router.get("/cart", authMiddleware, BookingController.getCart);
router.put("/cart/item", authMiddleware, BookingController.updateCartItem);
router.put("/cart/tip", authMiddleware, BookingController.updateTip);
router.post("/cart/checkout", authMiddleware, BookingController.proceedToPayment);

// Payment Routes
router.post("/book/payment", authMiddleware, BookingController.processPayment);
router.post("/booking/:bookingId/complete-cash-payment", authMiddleware, BookingController.completeCashPayment);

// Booking Routes
router.get("/booking/:id", authMiddleware, BookingController.getBooking);
router.get("/customer/booking", authMiddleware, BookingController.getBookingByCustomer);

// Provider Assignment Routes
router.post("/booking/assign-provider", authMiddleware, BookingController.manuallyAssignProvider);
router.get("/booking/:bookingId/eligible-providers", authMiddleware, BookingController.getEligibleProviders);

module.exports = router;