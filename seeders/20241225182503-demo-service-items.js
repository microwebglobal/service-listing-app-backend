'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('ServiceItems', [
      {
        item_id: 'ITEM001',
        service_id: 'SRV002',
        name: 'AC Less/No Cooling Repair',
        description: 'Fix cooling issues in AC',
        base_price: 399,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'ITEM002',
        service_id: 'SRV002',
        name: 'AC Gas Refill',
        description: 'Refill AC gas/refrigerant',
        base_price: 799,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'ITEM003',
        service_id: 'SRV001',
        name: 'Full Arms Waxing',
        description: 'Premium waxing for full arms',
        base_price: 299,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'ITEM004',
        service_id: 'SRV001',
        name: 'Full Legs Waxing',
        description: 'Premium waxing for full legs',
        base_price: 499,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('ServiceItems', null, {});
  }
};