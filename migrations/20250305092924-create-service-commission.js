"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_commissions", {
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
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
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
    await queryInterface.addIndex("service_commissions", ["city_id"]);
    await queryInterface.addIndex("service_commissions", [
      "item_id",
      "item_type",
    ]);
    await queryInterface.addIndex("service_commissions", ["item_type"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_commissions");
  },
};
