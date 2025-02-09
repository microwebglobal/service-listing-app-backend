"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("package_sections", {
      section_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      package_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "packages",
          key: "package_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      icon_url: Sequelize.STRING(255),
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex("package_sections", ["package_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("package_sections");
  },
};
