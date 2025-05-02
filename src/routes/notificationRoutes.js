const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");

const NotificationController = require("../controllers/NotificationController.js");

router.get("/", authMiddleware, NotificationController.getUserNotification);

router.get(
  "/filter",
  authMiddleware,
  NotificationController.filterNotifications
);

router.get(
  "/settings",
  authMiddleware,
  NotificationController.getUserPrefferedNotificationMethods
);

router.delete(
  "/:id",
  authMiddleware,
  NotificationController.deleteNotification
);

router.put("/:id/read", authMiddleware, NotificationController.markAsRead);

router.put("/read-all", authMiddleware, NotificationController.markAllAsRead);

router.delete("/delete-all", authMiddleware, NotificationController.deleteAll);

module.exports = router;
