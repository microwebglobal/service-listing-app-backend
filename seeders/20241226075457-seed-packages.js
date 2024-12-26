'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First insert packages
    await queryInterface.bulkInsert('packages', [
      {
        package_id: 'PKG001',
        type_id: 'TYPE001',
        name: 'Regular Full Body Wax Package',
        description: 'Complete regular waxing package',
        base_price: 999,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        package_id: 'PKG002',
        type_id: 'TYPE002',
        name: 'Rica Full Body Package',
        description: 'Complete Rica waxing package',
        base_price: 1499,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Then insert package items
    await queryInterface.bulkInsert('package_items', [
      {
        item_id: 'PITEM001',
        package_id: 'PKG001',
        name: 'Under Arms Regular Wax',
        description: 'Under arms waxing service',
        price: 99,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM002',
        package_id: 'PKG001',
        name: 'Full Arms Regular Wax',
        description: 'Full arms waxing service',
        price: 299,
        quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Finally insert city-specific pricing for packages and package items
    await queryInterface.bulkInsert('city_specific_pricing', [
      {
        city_id: 'CTY001',
        item_id: 'PKG001',
        item_type: 'package',
        price: 1199,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        item_id: 'PKG001',
        item_type: 'package',
        price: 999,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001',
        item_id: 'PITEM001',
        item_type: 'package_item',
        price: 129,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('city_specific_pricing', { 
      item_type: { [Sequelize.Op.in]: ['package', 'package_item'] }
    }, {});
    await queryInterface.bulkDelete('package_items', null, {});
    await queryInterface.bulkDelete('packages', null, {});
  }
};