'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed system settings
    await queryInterface.bulkInsert('system_settings', [
      {
        category: 'provider_assignment',
        key: 'individual_provider_percentage',
        value: JSON.stringify(70),
        data_type: 'number',
        description: 'Target percentage for individual provider assignments',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'provider_assignment',
        key: 'business_provider_percentage',
        value: JSON.stringify(30),
        data_type: 'number',
        description: 'Target percentage for business provider assignments',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'provider_assignment',
        key: 'individual_range_start',
        value: JSON.stringify(1),
        data_type: 'number',
        description: 'Starting number in range for individual providers',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'provider_assignment',
        key: 'individual_range_end',
        value: JSON.stringify(7),
        data_type: 'number',
        description: 'Ending number in range for individual providers',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'provider_assignment',
        key: 'business_range_start',
        value: JSON.stringify(8),
        data_type: 'number',
        description: 'Starting number in range for business providers',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'provider_assignment',
        key: 'business_range_end',
        value: JSON.stringify(10),
        data_type: 'number',
        description: 'Ending number in range for business providers',
        is_encrypted: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed default booking assignment settings
    await queryInterface.bulkInsert('booking_assignment_settings', [
      {
        is_auto_assignment_enabled: true,
        auto_reject_timeout: 300,
        retry_count: 3,
        cooldown_period: 1800,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('booking_assignment_settings', null, {});
    await queryInterface.bulkDelete('system_settings', null, {});
  }
};