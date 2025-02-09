"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("enquiry_service_cities", {
      enquiry_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_provider_enquiries",
          key: "enquiry_id",
        },
        onDelete: "CASCADE",
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("enquiry_service_cities");
  },
};
