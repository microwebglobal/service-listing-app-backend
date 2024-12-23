'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      {
        name: 'Service A',
        description: 'Description for Service A',
        base_price: 100.00,
        advance_percentage: 20,
        max_booking_days: 7,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Service B',
        description: 'Description for Service B',
        base_price: 150.00,
        advance_percentage: 15,
        max_booking_days: 10,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Service C',
        description: 'Description for Service C',
        base_price: 200.00,
        advance_percentage: 25,
        max_booking_days: 5,
        status: 'inactive',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};
