"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed system settings
    await queryInterface.bulkInsert("system_settings", [
      {
        category: "provider_assignment",
        key: "individual_provider_percentage",
        value: JSON.stringify(70),
        data_type: "number",
        description: "Target percentage for individual provider assignments",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "business_provider_percentage",
        value: JSON.stringify(30),
        data_type: "number",
        description: "Target percentage for business provider assignments",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "individual_range_start",
        value: JSON.stringify(1),
        data_type: "number",
        description: "Starting number in range for individual providers",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "individual_range_end",
        value: JSON.stringify(7),
        data_type: "number",
        description: "Ending number in range for individual providers",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "business_range_start",
        value: JSON.stringify(8),
        data_type: "number",
        description: "Starting number in range for business providers",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "business_range_end",
        value: JSON.stringify(10),
        data_type: "number",
        description: "Ending number in range for business providers",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "provider_assignment",
        key: "auto_assignment_enabled",
        value: JSON.stringify(true),
        data_type: "boolean",
        description: "Auto provider assignment enabled or not",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "booking",
        key: "booking_cancellation_penalty_global",
        value: JSON.stringify(20),
        data_type: "number",
        description:
          "Penalty percentager for booking cancellation after grace period",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category: "booking",
        key: "booking_grace_period_global",
        value: JSON.stringify(8),
        data_type: "number",
        description: "Global grace period for customer bookings",
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Seed default booking assignment settings
    await queryInterface.bulkInsert("booking_assignment_settings", [
      {
        is_auto_assignment_enabled: true,
        auto_reject_timeout: 300,
        retry_count: 3,
        cooldown_period: 1800,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("booking_assignment_settings", null, {});
    await queryInterface.bulkDelete("system_settings", null, {});
  },
};
