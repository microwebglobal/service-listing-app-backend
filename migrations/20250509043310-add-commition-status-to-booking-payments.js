"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("booking_payments", "commition_status", {
      type: Sequelize.ENUM(
        "pending",
        "paid_by_provider",
        "settled",
        "waved_off"
      ),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("booking_payments", "commition_status");
  },
};
