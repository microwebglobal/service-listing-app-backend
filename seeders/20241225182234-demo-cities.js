'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Cities', [
      {
        city_id: 'CTY001',
        name: 'Mumbai',
        state: 'Maharashtra',
        status: 'active',
        latitude: 19.0760,
        longitude: 72.8777,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        name: 'Delhi',
        state: 'Delhi',
        status: 'active',
        latitude: 28.7041,
        longitude: 77.1025,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Cities', null, {});
  }
};