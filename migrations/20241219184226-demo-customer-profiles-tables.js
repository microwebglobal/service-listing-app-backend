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
        allowNull: true
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      default_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_profiles');
  }
};