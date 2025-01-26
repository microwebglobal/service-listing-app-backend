const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Cart Management Routes
router.post("/cart/add", BookingController.addToCart);
router.get("/cart", BookingController.getCart);
router.put("/cart/item", BookingController.updateCartItem);
router.put("/cart/tip", BookingController.updateTip);
router.post("/cart/checkout", BookingController.proceedToPayment);

module.exports = router;