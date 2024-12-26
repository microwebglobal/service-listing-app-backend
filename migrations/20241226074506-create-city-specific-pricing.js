'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First create the ENUM type
    await queryInterface.sequelize.query(
      'CREATE TYPE enum_city_specific_pricing_item_type AS ENUM (\'service_item\', \'package\', \'package_item\')'
    );

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
        type: 'enum_city_specific_pricing_item_type',
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

    // Add unique constraint
    await queryInterface.addIndex('city_specific_pricing', 
      ['city_id', 'item_id', 'item_type'], 
      {
        unique: true,
        name: 'city_specific_pricing_unique_constraint'
      }
    );
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('city_specific_pricing');
    // Drop the ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE enum_city_specific_pricing_item_type'
    );
  }
};
