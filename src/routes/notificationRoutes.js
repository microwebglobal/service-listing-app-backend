const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const NotificationController = require("../controllers/NotificationController.js");

router.get("/", authMiddleware, NotificationController.getUserNotification);
module.exports = router;
