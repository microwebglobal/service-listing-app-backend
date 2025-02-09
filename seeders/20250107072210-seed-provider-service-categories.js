"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("provider_service_categories", [
      {
        provider_id: 1,
        category_id: "CAT002",
        experience_years: 5,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        category_id: "CAT003",
        experience_years: 3,
        is_primary: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provider_service_categories", null, {});
  },
};
