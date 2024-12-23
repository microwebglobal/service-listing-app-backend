'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      u_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      pw: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'customer', "service_provider"),
        defaultValue: 'customer',
        allowNull: false
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      
    }, {
      timestamps: true,
      indexes: [
        
        {
          unique: true,
          fields: ['mobile']
        }
      ]
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};