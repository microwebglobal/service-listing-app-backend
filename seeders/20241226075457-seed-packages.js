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
        duration_hours: 1,
        duration_minutes: 30,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        package_id: 'PKG002',
        type_id: 'TYPE002',
        name: 'Rica Full Body Package',
        description: 'Complete Rica waxing package',
        duration_hours: 2,
        duration_minutes: 0,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert package sections
    await queryInterface.bulkInsert('package_sections', [
      {
        section_id: 'SECT001',
        package_id: 'PKG001',
        name: 'Arms Services',
        description: 'Waxing services for arms',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        section_id: 'SECT002',
        package_id: 'PKG002',
        name: 'Arms Services',
        description: 'Rica waxing services for arms',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Then insert package items
    await queryInterface.bulkInsert('package_items', [
      {
        item_id: 'PITEM001',
        section_id: 'SECT001',
        name: 'Under Arms Regular Wax',
        description: 'Under arms waxing service',
        price: 99,
        is_default: true,
        is_none_option: false,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM002',
        section_id: 'SECT001',
        name: 'Full Arms Regular Wax',
        description: 'Full arms waxing service',
        price: 299,
        is_default: true,
        is_none_option: false,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM003',
        section_id: 'SECT002',
        name: 'Under Arms Rica Wax',
        description: 'Under arms Rica waxing service',
        price: 149,
        is_default: true,
        is_none_option: false,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM004',
        section_id: 'SECT002',
        name: 'Full Arms Rica Wax',
        description: 'Full arms Rica waxing service',
        price: 449,
        is_default: true,
        is_none_option: false,
        display_order: 2,
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
    await queryInterface.bulkDelete('package_sections', null, {});
    await queryInterface.bulkDelete('packages', null, {});
  }
};