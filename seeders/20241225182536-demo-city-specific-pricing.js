'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('CitySpecificPricings', [
      // Service level pricing
      {
        city_id: 'CTY001',
        service_id: 'SRV001',
        price: 1199,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        service_id: 'SRV001',
        price: 999,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001',
        service_id: 'SRV002',
        price: 449,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Item level pricing
      {
        city_id: 'CTY001',
        item_id: 'ITEM001',
        price: 449,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001',
        item_id: 'ITEM002',
        price: 849,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        item_id: 'ITEM003',
        price: 349,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        item_id: 'ITEM004',
        price: 549,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('CitySpecificPricings', null, {});
  }
};
