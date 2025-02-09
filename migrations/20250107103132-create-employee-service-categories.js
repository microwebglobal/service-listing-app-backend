"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employee_service_categories", {
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_provider_employees",
          key: "employee_id",
        },
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "service_categories",
          key: "category_id",
        },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("employee_service_categories");
  },
};
