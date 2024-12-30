'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert packages
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
      },
      {
        section_id: 'SECT003',
        package_id: 'PKG001',
        name: 'Legs Services',
        description: 'Waxing services for legs',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        section_id: 'SECT004',
        package_id: 'PKG002',
        name: 'Legs Services',
        description: 'Rica waxing services for legs',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert package items
    await queryInterface.bulkInsert('package_items', [
      // Arms Section Items - Regular Package
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
      // Arms Section Items - Rica Package
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
      },
      // Legs Section Items - Regular Package
      {
        item_id: 'PITEM005',
        section_id: 'SECT003',
        name: 'Half Legs Regular Wax',
        description: 'Half legs waxing service',
        price: 349,
        is_default: true,
        is_none_option: false,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM006',
        section_id: 'SECT003',
        name: 'Full Legs Regular Wax',
        description: 'Full legs waxing service',
        price: 599,
        is_default: true,
        is_none_option: false,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Legs Section Items - Rica Package
      {
        item_id: 'PITEM007',
        section_id: 'SECT004',
        name: 'Half Legs Rica Wax',
        description: 'Half legs Rica waxing service',
        price: 499,
        is_default: true,
        is_none_option: false,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM008',
        section_id: 'SECT004',
        name: 'Full Legs Rica Wax',
        description: 'Full legs Rica waxing service',
        price: 799,
        is_default: true,
        is_none_option: false,
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('special_pricing', [
      // Global special prices (no city_id)
      {
        item_id: 'PITEM001', // Under Arms Regular Wax
        item_type: 'package_item',
        city_id: null,
        special_price: 79.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-02-29'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM003', // Under Arms Rica Wax
        item_type: 'package_item',
        city_id: null,
        special_price: 129.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-02-29'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Mumbai (CTY001) specific special prices
      {
        item_id: 'PITEM002', // Full Arms Regular Wax
        item_type: 'package_item',
        city_id: 'CTY001',
        special_price: 299.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM004', // Full Arms Rica Wax
        item_type: 'package_item',
        city_id: 'CTY001',
        special_price: 399.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Delhi (CTY002) specific special prices
      {
        item_id: 'PITEM005', // Half Legs Regular Wax
        item_type: 'package_item',
        city_id: 'CTY002',
        special_price: 299.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM007', // Half Legs Rica Wax
        item_type: 'package_item',
        city_id: 'CTY002',
        special_price: 449.99,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },

      // Future special prices (inactive)
      {
        item_id: 'PITEM006', // Full Legs Regular Wax
        item_type: 'package_item',
        city_id: null,
        special_price: 499.99,
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-04-30'),
        status: 'inactive',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        item_id: 'PITEM008', // Full Legs Rica Wax
        item_type: 'package_item',
        city_id: null,
        special_price: 699.99,
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-04-30'),
        status: 'inactive',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert city-specific pricing for packages and package items
    await queryInterface.bulkInsert('city_specific_pricing', [
      // Package pricing for different cities
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PKG001',
        item_type: 'package',
        price: 1199,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PKG001',
        item_type: 'package',
        price: 999,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PKG002',
        item_type: 'package',
        price: 1899,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PKG002',
        item_type: 'package',
        price: 1699,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Package items pricing for different cities - Regular Package
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PITEM001',
        item_type: 'package_item',
        price: 129,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PITEM001',
        item_type: 'package_item',
        price: 89,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PITEM002',
        item_type: 'package_item',
        price: 349,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PITEM002',
        item_type: 'package_item',
        price: 279,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Package items pricing for different cities - Rica Package
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PITEM003',
        item_type: 'package_item',
        price: 179,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PITEM003',
        item_type: 'package_item',
        price: 139,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY001', // Mumbai
        item_id: 'PITEM004',
        item_type: 'package_item',
        price: 499,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002', // Delhi
        item_id: 'PITEM004',
        item_type: 'package_item',
        price: 429,
        created_at: new Date(),
        updated_at: new Date()
      },

      
    ], {});

    
  },

  down: async (queryInterface, Sequelize) => {
    // Delete all related data in reverse order
    await queryInterface.bulkDelete('city_specific_pricing', { 
      item_type: { [Sequelize.Op.in]: ['package', 'package_item'] }
    }, {});
    await queryInterface.bulkDelete('package_items', null, {});
    await queryInterface.bulkDelete('package_sections', null, {});
    await queryInterface.bulkDelete('packages', null, {});
  }
};