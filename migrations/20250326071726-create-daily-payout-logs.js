"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_payout_logs", {
      log_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      payout_amount: {
        type: Sequelize.DECIMAL,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.ENUM("pending", "card", "upi", "net_banking", "cash"),
      },
      date: {
        type: Sequelize.DATEONLY,
      },
      processed_at: {
        type: Sequelize.DATE,
      },
      compleated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payout_status: {
        type: Sequelize.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      transaction_reference: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("daily_payout_logs");
  },
};
