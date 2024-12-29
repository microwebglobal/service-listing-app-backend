'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('city_specific_pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      item_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_type: {
        type: Sequelize.ENUM('service_item', 'package', 'package_item'),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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

    // Add indexes
    await queryInterface.addIndex('city_specific_pricing', ['city_id']);
    await queryInterface.addIndex('city_specific_pricing', ['item_id', 'item_type']);
    await queryInterface.addIndex('city_specific_pricing', ['item_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('city_specific_pricing');
    // Drop the enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_city_specific_pricing_item_type;');
  }
};