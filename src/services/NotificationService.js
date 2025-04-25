// services/NotificationService.js
const { Notification } = require("../models");

class NotificationService {
  static async createNotification({ userId, type, title, message, data = {} }) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        isRead: false,
        created_at: new Date(),
      });

      return notification;
    } catch (error) {
      console.error("Notification creation error:", error);
    }
  }
}

module.exports = NotificationService;
