'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_address', [
      {
        u_id: 1,
        address_type: 'primary',
        street: '123 Main St',
        city: 'Colombo',
        state: 'Western',
        postal_code: '10100',
        country: 'Sri Lanka',
        long: 79.9582,
        lat: 6.9271,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        u_id: 1,
        address_type: 'secondary',
        street: '456 Park Ave',
        city: 'Kandy',
        state: 'Central',
        postal_code: '20000',
        country: 'Sri Lanka',
        long: 80.6347,
        lat: 7.2906,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_address', null, {});
  }
};
