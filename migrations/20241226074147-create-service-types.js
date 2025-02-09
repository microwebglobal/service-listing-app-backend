'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('service_types', {
      type_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      sub_category_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'sub_category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      icon_url: Sequelize.STRING(255),
      description: Sequelize.TEXT,
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
    await queryInterface.dropTable('service_types');
  }
};