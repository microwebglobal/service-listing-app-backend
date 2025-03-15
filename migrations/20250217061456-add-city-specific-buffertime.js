"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("city_specific_buffertime", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      item_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      item_type: {
        type: Sequelize.ENUM("service_item", "package", "package_item"),
        allowNull: false,
      },
      buffer_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      buffer_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

    // Add indexes
    await queryInterface.addIndex("city_specific_buffertime", ["city_id"]);
    await queryInterface.addIndex("city_specific_buffertime", [
      "item_id",
      "item_type",
    ]);
    await queryInterface.addIndex("city_specific_buffertime", ["item_type"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("city_specific_buffertime");
  },
};
