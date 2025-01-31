"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create package_items table
    await queryInterface.createTable("package_items", {
      item_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      section_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "package_sections",
          key: "section_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: Sequelize.TEXT,
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_none_option: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Add package_items indexes
    await queryInterface.addIndex("package_items", ["section_id"]);
    await queryInterface.addIndex("package_items", ["is_default"]);
    await queryInterface.addIndex("package_items", ["is_none_option"]);

    // Add item_type enum value to city_specific_pricing if not exists
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_city_specific_pricing_item_type" 
      ADD VALUE IF NOT EXISTS 'package_item';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop package_items table
    await queryInterface.dropTable("package_items");
  },
};
