'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('service_types', [
      {
        type_id: 'TYPE001',
        sub_category_id: 'SCAT001',
        name: 'Regular Wax',
        icon_url: 'ac-repair-icon.png',
        description: 'Traditional waxing services',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        type_id: 'TYPE002',
        sub_category_id: 'SCAT001',
        name: 'Rica Wax',
        icon_url: 'ac-repair-icon.png',
        description: 'Premium Italian waxing',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('service_types', null, {});
  }
};
