"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "notifications",
      [
        {
          user_id: 1,
          message: "Your booking has been confirmed!",
          type: "booking",
          isRead: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 2,
          message: "Your appointment is tomorrow at 10 AM.",
          type: "reminder",
          isRead: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("notifications", null, {});
  },
};
