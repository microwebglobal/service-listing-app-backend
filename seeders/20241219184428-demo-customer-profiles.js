'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('customer_profiles', [{
      u_id: 1, 
      tier_status: 'Bronze',
      loyalty_points: 0,
      default_address: '',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('customer_profiles', null, {});
  }
};