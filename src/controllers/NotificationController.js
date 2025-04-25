const { Notification } = require("../models");

class NotificationController {
  // Get all notifications for a user
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

  // Delete a specific notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Notification.destroy({
        where: { notification_id: id },
      });

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Delete Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // Mark a specific notification as read
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await Notification.findByPk(id);

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      notification.isRead = true;
      await notification.save();

      return res
        .status(200)
        .json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark As Read Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // Filter notifications by type and date range
  static async filterNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { type, startDate, endDate } = req.query;

      const whereClause = { user_id: userId };
      if (type) whereClause.type = type;
      if (startDate && endDate) {
        whereClause.created_at = {
          [require("sequelize").Op.between]: [
            new Date(startDate),
            new Date(endDate),
          ],
        };
      }

      const filtered = await Notification.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Filtered notifications retrieved successfully",
        data: filtered,
      });
    } catch (error) {
      console.error("Filter Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { user_id: userId } }
      );

      return res
        .status(200)
        .json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark All As Read Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // Delete all notifications for user
  static async deleteAll(req, res) {
    try {
      const userId = req.user.id;

      await Notification.destroy({ where: { user_id: userId } });

      return res
        .status(200)
        .json({ success: true, message: "All notifications deleted" });
    } catch (error) {
      console.error("Delete All Error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}

module.exports = NotificationController;
