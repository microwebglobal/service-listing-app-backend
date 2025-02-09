"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("provider_service_cities", [
      {
        provider_id: 1,
        city_id: "CTY001",
        service_radius: 20.5,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        city_id: "CTY002",
        service_radius: 15.0,
        is_primary: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provider_service_cities", null, {});
  },
};
