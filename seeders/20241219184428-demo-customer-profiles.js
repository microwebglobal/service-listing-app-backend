'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('customer_profiles', [{
      u_id: 1, // assuming user with ID 1 exists
      tier_status: 'Bronze',
      loyalty_points: 0,
      default_address: '123 Main St, City',
      created_by: 'system',
      updated_by: 'system',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('customer_profiles', null, {});
  }
};