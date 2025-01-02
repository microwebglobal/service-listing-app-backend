'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First insert service items
    await queryInterface.bulkInsert('service_items', [
      {
        item_id: 'ITEM001',
        service_id: 'SRV001',
        name: 'Full Arms Wax',
        description: 'Regular waxing for arms',
        overview: 'Regular waxing for arms',
        base_price: 299,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'ITEM002',
        service_id: 'SRV002',
        name: 'Full Legs Wax',
        description: 'Regular waxing for legs',
        overview: 'Regular waxing for arms',
        base_price: 399,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'ITEM003',
        service_id: 'SRV003',
        name: 'Full Arms Rica Wax',
        description: 'Premium Rica waxing for arms',
        overview: 'Regular waxing for arms',
        base_price: 499,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Then insert city-specific pricing for service items
    await queryInterface.bulkInsert('city_specific_pricing', [
      {
        city_id: 'CTY001',
        item_id: 'ITEM001',
        item_type: 'service_item',
        price: 349,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        item_id: 'ITEM001',
        item_type: 'service_item',
        price: 299,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Add more city-specific pricing...
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('city_specific_pricing', { item_type: 'service_item' }, {});
    await queryInterface.bulkDelete('service_items', null, {});
  }
};
