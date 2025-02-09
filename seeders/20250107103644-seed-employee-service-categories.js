"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("employee_service_categories", [
      {
        employee_id: 1,
        category_id: "CAT001",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        employee_id: 1,
        category_id: "CAT002",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        employee_id: 2,
        category_id: "CAT003",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("employee_service_categories", null, {});
  },
};
