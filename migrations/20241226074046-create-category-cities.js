'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('category_cities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      category_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'service_categories',
          key: 'category_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'city_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    await queryInterface.addIndex('category_cities', ['category_id', 'city_id'], {
      unique: true
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('category_cities');
  }
};
