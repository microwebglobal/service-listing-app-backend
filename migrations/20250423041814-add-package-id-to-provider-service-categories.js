"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "provider_service_categories",
      "package_id",
      {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "packages",
          key: "package_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Optional reference to a service package",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "provider_service_categories",
      "package_id"
    );
  },
};
