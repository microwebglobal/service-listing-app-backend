"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("service_provider_employees", [
      {
        provider_id: 1,
        user_id: 3,
        role: "Plumber",
        qualification: "Licensed Plumber",
        years_experience: 7,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        user_id: 4,
        role: "Paint Man",
        qualification: "Professional Painter",
        years_experience: 4,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_employees", null, {});
  },
};
