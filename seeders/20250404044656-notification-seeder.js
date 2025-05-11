"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check for existing notifications
    const existingNotifications = await queryInterface.sequelize.query(
      'SELECT notification_id FROM "notifications"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (existingNotifications.length > 0) {
      console.log("Notifications already exist, skipping insertion");
      return Promise.resolve();
    }
    
    // Check if users exist
    const users = await queryInterface.sequelize.query(
      'SELECT u_id FROM "users" ORDER BY u_id LIMIT 10',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      console.log("No users found, skipping notifications");
      return Promise.resolve();
    }
    
    // Current date and time
    const now = new Date();
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Two days ago
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Three days ago
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return queryInterface.bulkInsert(
      "notifications",
      [
        {
          user_id: users[0].u_id,
          title: "Booking Confirmed",
          message: "Your booking #BK123456 has been confirmed!",
          type: "booking",
          isRead: false,
          created_at: yesterday,
          updated_at: yesterday,
        },
        {
          user_id: users[0].u_id,
          title: "Upcoming Appointment",
          message: "Reminder: Your appointment is tomorrow at 10:00 AM.",
          type: "reminder",
          isRead: true,
          created_at: twoDaysAgo,
          updated_at: twoDaysAgo,
        },
        {
          user_id: users[0].u_id,
          title: "Special Offer",
          message: "Get 20% off on your next salon booking. Use code BEAUTY20.",
          type: "general",
          isRead: false,
          created_at: threeDaysAgo,
          updated_at: threeDaysAgo,
        },
        {
          user_id: users[1].u_id,
          title: "New Booking Request",
          message: "You have received a new booking request #BK123457.",
          type: "booking",
          isRead: false,
          created_at: yesterday,
          updated_at: yesterday,
        },
        {
          user_id: users[1].u_id,
          title: "Payment Received",
          message: "Payment of ₹1,250 has been credited to your account.",
          type: "general",
          isRead: true,
          created_at: twoDaysAgo,
          updated_at: twoDaysAgo,
        },
        {
          user_id: users[2].u_id,
          title: "Assigned to Booking",
          message: "You have been assigned to booking #BK123458 at 2:00 PM today.",
          type: "booking",
          isRead: false,
          created_at: yesterday,
          updated_at: yesterday,
        },
        {
          user_id: users[2].u_id,
          title: "Schedule Change",
          message: "Your schedule has been updated for tomorrow.",
          type: "reminder",
          isRead: false,
          created_at: now,
          updated_at: now,
        }
      ]
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("notifications", null, {});
  },
};