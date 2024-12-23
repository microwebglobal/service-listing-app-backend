'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      service_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name cannot be empty',
          },
          len: {
            args: [2, 100],
            msg: 'Name must be between 2 and 100 characters',
          },
        },
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      base_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      advance_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      max_booking_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  }
};
