"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_service_categories", {
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
      category_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "service_categories",
          key: "category_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Years of experience in this specific category",
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if this is the provider's primary service category",
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
      "provider_service_categories",
      ["provider_id", "category_id"],
      {
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("provider_service_categories");
  },
};
