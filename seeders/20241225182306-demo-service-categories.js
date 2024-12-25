'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('ServiceCategories', [
      {
        category_id: 'CAT001',
        name: 'Salon for Women',
        slug: 'salon-for-women',
        icon_url: 'salon-icon.png',
        display_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 'CAT002',
        name: 'AC & Appliance Repair',
        slug: 'ac-appliance-repair',
        icon_url: 'ac-repair-icon.png',
        display_order: 2,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('CategoryCityAvailability', [
      {
        category_id: 'CAT001',
        city_id: 'CTY001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 'CAT001',
        city_id: 'CTY002',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 'CAT002',
        city_id: 'CTY001',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('CategoryCityAvailability', null, {});
    await queryInterface.bulkDelete('ServiceCategories', null, {});
  }
};
