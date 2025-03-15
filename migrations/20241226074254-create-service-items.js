"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("service_items", {
      item_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      service_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "services",
          key: "service_id",
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
      icon_url: Sequelize.STRING(255),
      overview: Sequelize.TEXT,
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      advance_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      is_home_visit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("service_items");
  },
};
