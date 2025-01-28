const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Apply authentication middleware to all routes
// router.use(authMiddleware);

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

module.exports = router;
