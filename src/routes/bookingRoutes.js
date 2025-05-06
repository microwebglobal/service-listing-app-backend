const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { authMiddleware } = require("../middlewares/auth.middleware");
const ProviderBookingController = require("../controllers/ProviderBookingController");
const CustomerBookingController = require("../controllers/CustomerBookingController");
const BookingAvailabilityService = require("../services/CheckBookingAvailabilityService");

// Cart Management Routes
router.post("/cart/add", authMiddleware, BookingController.addToCart);
router.get("/cart", authMiddleware, BookingController.getCart);
router.put("/cart/item", authMiddleware, BookingController.updateCartItem);
router.put("/cart/tip", authMiddleware, BookingController.updateTip);
router.post(
  "/cart/checkout",
  authMiddleware,
  BookingController.proceedToPayment
);

// Payment Routes
router.post("/book/payment", authMiddleware, BookingController.processPayment);
router.post(
  "/booking/:bookingId/complete-cash-payment",
  authMiddleware,
  BookingController.completeCashPayment
);

// Booking Routes
router.get("/booking/:id", authMiddleware, BookingController.getBooking);
router.get(
  "/customer/booking",
  authMiddleware,
  BookingController.getBookingByCustomer
);
router.put(
  "/booking/acceptence/:id",
  authMiddleware,
  BookingController.providerAcceptOrder
);
router.post("/booking/send-otp", ProviderBookingController.bookingSendOTP);
router.post("/booking/verify-otp", ProviderBookingController.bookingVerifyOTP);

// Provider Assignment Routes
router.post(
  "/booking/assign-provider",
  authMiddleware,
  BookingController.manuallyAssignProvider
);
router.get(
  "/booking/:bookingId/eligible-providers",
  authMiddleware,
  BookingController.getEligibleProviders
);

router.get(
  "/available/:providerId/employees",
  authMiddleware,
  BookingController.getAvailableEmployees
);

//customer booking mngment routes
router.get(
  "/booking/cancel/:id",
  authMiddleware,
  CustomerBookingController.customerCancellBooking
);

router.put(
  "/booking/cancel/confirm/:id",
  authMiddleware,
  CustomerBookingController.customerConfirmCancellBooking
);

router.post("/booking/availability", async (req, res, next) => {
  try {
    console.log(req.body);
    const unavailableSlots =
      await BookingAvailabilityService.checkAvailableSlots(req, res, next);
    res.status(200).json({
      success: true,
      data: unavailableSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
