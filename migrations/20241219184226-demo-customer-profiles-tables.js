'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_profiles', {
      cp_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      u_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'u_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tier_status: {
        type: Sequelize.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
        defaultValue: 'Bronze',
        allowNull: false
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      default_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'system'
      },
      updated_by: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'system'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('customer_profiles', ['u_id']);
    await queryInterface.addIndex('customer_profiles', ['tier_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_profiles');
  }
};