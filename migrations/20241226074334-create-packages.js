'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('packages', {
      package_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      type_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'service_types',
          key: 'type_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: Sequelize.TEXT,
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('packages');
  }
};