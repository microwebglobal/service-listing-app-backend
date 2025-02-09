"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("services", {
      service_id: {
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
      icon_url: Sequelize.STRING(255),
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("services");
  },
};
