"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("enquiry_service_cities", [
      {
        enquiry_id: 1,
        city_id: "CTY002",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        enquiry_id: 1,
        city_id: "CTY001",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        enquiry_id: 2,
        city_id: "CTY001",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("enquiry_service_cities", null, {});
  },
};
