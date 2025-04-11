"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("packages", {
      package_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      type_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "service_types",
          key: "type_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: Sequelize.TEXT,
      duration_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      grace_period: {
        type: Sequelize.DECIMAL(5, 2),
      },
      penalty_percentage: {
        type: Sequelize.DECIMAL(5, 2),
      },
      advance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
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

    // Add index for type_id
    await queryInterface.addIndex("packages", ["type_id"]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("packages");
  },
};
