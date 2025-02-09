'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('sub_categories', [
      {
        sub_category_id: 'SCAT001',
        category_id: 'CAT001',
        name: 'Waxing',
        slug: 'waxing',
        icon_url: 'ac-repair-icon.png',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        sub_category_id: 'SCAT002',
        category_id: 'CAT002',
        name: 'AC Services',
        slug: 'ac-services',
        icon_url: 'ac-repair-icon.png',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sub_categories', null, {});
  }
};
