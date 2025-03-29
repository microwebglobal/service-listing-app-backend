"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("daily_payout_logs", [
      {
        provider_id: 1,
        payout_amount: 100.5,
        reason: "Service fee payout",
        payment_method: "card",
        date: new Date(),
        processed_at: new Date(),
        compleated_at: new Date(),
        payout_status: "completed",
        transaction_reference: "TXN123456",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        provider_id: 2,
        payout_amount: 75.0,
        reason: "Subscription payout",
        payment_method: "upi",
        date: new Date(),
        processed_at: null,
        compleated_at: null,
        payout_status: "pending",
        transaction_reference: "TXN789123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        provider_id: 3,
        payout_amount: 50.75,
        reason: "Service refund payout",
        payment_method: "net_banking",
        date: new Date(),
        processed_at: new Date(),
        compleated_at: new Date(),
        payout_status: "failed",
        transaction_reference: "TXN456789",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("daily_payout_logs", null, {});
  },
};
