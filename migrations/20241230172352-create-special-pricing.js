'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('special_pricing', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      item_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_type: {
        type: Sequelize.ENUM('service_item', 'package_item'),
        allowNull: false
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'city_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      special_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('special_pricing', ['item_id', 'item_type']);
    await queryInterface.addIndex('special_pricing', ['city_id']);
    await queryInterface.addIndex('special_pricing', ['status']);
    await queryInterface.addIndex('special_pricing', ['start_date', 'end_date']);
    
    await queryInterface.addIndex('special_pricing', 
      ['item_id', 'item_type', 'city_id', 'status', 'start_date', 'end_date'],
      {
        name: 'idx_special_pricing_active_check'
      }
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE special_pricing 
      ADD CONSTRAINT chk_date_validity 
      CHECK (end_date > start_date)
    `);
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE special_pricing 
        DROP CONSTRAINT chk_date_validity
      `);
    } catch (error) {
      console.log('Check constraint might not exist, continuing...');
    }

    await queryInterface.dropTable('special_pricing');
  }
};