const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { verifyToken } = require("../middlewares/auth.middleware");

// Cart Management Routes
router.post(
  "/cart/add",
  verifyToken,  // Changed from authMiddleware to verifyToken
  BookingController.addToCart
);

router.get(
  "/cart",
  verifyToken,
  BookingController.getCart
);

router.put(
  "/cart/item",
  verifyToken,
  BookingController.updateCartItem
);

router.put(
  "/cart/tip",
  verifyToken,
  BookingController.updateTip
);

router.post(
  "/cart/checkout",
  verifyToken,
  BookingController.proceedToPayment
);

module.exports = router;