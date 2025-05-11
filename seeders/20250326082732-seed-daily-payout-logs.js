"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if providers exist
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (providers.length === 0) {
      console.log("No providers found, skipping payout logs");
      return Promise.resolve();
    }
    
    // Check for existing payout logs
    const existingLogs = await queryInterface.sequelize.query(
      'SELECT log_id FROM "daily_payout_logs"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (existingLogs.length > 0) {
      console.log("Payout logs already exist, skipping insertion");
      return Promise.resolve();
    }
    
    // Current date - 7 days for first entry
    const firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 7);
    
    // Current date - 3 days for second entry
    const secondDate = new Date();
    secondDate.setDate(secondDate.getDate() - 3);
    
    // Current date - 1 day for third entry
    const thirdDate = new Date();
    thirdDate.setDate(thirdDate.getDate() - 1);
    
    return queryInterface.bulkInsert("daily_payout_logs", [
      {
        provider_id: providers[0].provider_id,
        payout_amount: 12450.75,
        reason: "Weekly service payout",
        payment_method: "bank",
        date: firstDate,
        processed_at: firstDate,
        compleated_at: firstDate,
        payout_status: "completed",
        transaction_reference: "TXN123456789",
        createdAt: firstDate,
        updatedAt: firstDate,
      },
      {
        provider_id: providers[0].provider_id,
        payout_amount: 8750.50,
        reason: "Service fee payout",
        payment_method: "upi",
        date: secondDate,
        processed_at: secondDate,
        compleated_at: secondDate,
        payout_status: "completed",
        transaction_reference: "TXN987654321",
        createdAt: secondDate,
        updatedAt: secondDate,
      },
      {
        provider_id: providers[0].provider_id,
        payout_amount: 4320.25,
        reason: "Subscription payout",
        payment_method: "bank",
        date: thirdDate,
        processed_at: thirdDate,
        compleated_at: null,
        payout_status: "pending",
        transaction_reference: "TXN456789123",
        createdAt: thirdDate,
        updatedAt: thirdDate,
      },
      {
        provider_id: providers[1].provider_id,
        payout_amount: 9875.00,
        reason: "Weekly service payout",
        payment_method: "upi",
        date: firstDate,
        processed_at: firstDate,
        compleated_at: firstDate,
        payout_status: "completed",
        transaction_reference: "TXN234567890",
        createdAt: firstDate,
        updatedAt: firstDate,
      },
      {
        provider_id: providers[1].provider_id,
        payout_amount: 6540.50,
        reason: "Service fee payout",
        payment_method: "upi",
        date: thirdDate,
        processed_at: thirdDate,
        compleated_at: null,
        payout_status: "pending",
        transaction_reference: "TXN345678901",
        createdAt: thirdDate,
        updatedAt: thirdDate,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("daily_payout_logs", null, {});
  },
};