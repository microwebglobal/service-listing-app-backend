'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('SubCategories', [
      {
        sub_category_id: 'SCAT001',
        category_id: 'CAT001',
        name: 'Waxing',
        slug: 'waxing',
        display_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        sub_category_id: 'SCAT002',
        category_id: 'CAT002',
        name: 'AC Services',
        slug: 'ac-services',
        display_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('SubCategories', null, {});
  }
};