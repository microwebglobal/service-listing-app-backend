'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('service_items', {
      item_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      service_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'services',
          key: 'service_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: Sequelize.TEXT,
      overview: Sequelize.TEXT,
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('service_items');
  }
};
