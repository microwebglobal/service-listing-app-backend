'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Services', [
      {
        service_id: 'SRV001',
        sub_category_id: 'SCAT001',
        name: 'Full Body Wax',
        description: 'Premium waxing service',
        base_price: 999,
        display_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        service_id: 'SRV002',
        sub_category_id: 'SCAT002',
        name: 'AC Repair & Gas Refill',
        description: 'Professional AC repair service',
        base_price: 399,
        display_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Services', null, {});
  }
};
