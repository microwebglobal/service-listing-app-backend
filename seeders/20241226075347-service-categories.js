'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('service_categories', [
      {
        category_id: 'CAT001',
        name: 'Salon for Women',
        slug: 'salon-for-women',
        icon_url: '/uploads/images/1735813069408.jpg',
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 'CAT002',
        name: 'AC & Appliance Repair',
        slug: 'ac-appliance-repair',
        icon_url: '/uploads/images/1735813165476.webp',
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert category-city relationships
    await queryInterface.bulkInsert('category_cities', [
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
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('category_cities', null, {});
    await queryInterface.bulkDelete('service_categories', null, {});
  }
};