const { User, Notification, sequelize } = require("../models");
const IdGenerator = require("../utils/helper");
const path = require("path");
const fs = require("fs");

class NotificationController {
  static async getUserNotification(req, res, next) {
    try {
      const userId = req.user.id;

      const notifications = await Notification.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = NotificationController;
