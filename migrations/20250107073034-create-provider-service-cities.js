"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_service_cities", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      service_radius: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Service radius for this specific city in kilometers",
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if this is the provider's primary service city",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      "provider_service_cities",
      ["provider_id", "city_id"],
      {
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("provider_service_cities");
  },
};
