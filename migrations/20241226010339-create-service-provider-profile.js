'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('service_provider_profiles', {
      sp_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      business_type: {
        type: Sequelize.ENUM('individual', 'business'),
        defaultValue: 'individual',
        allowNull: false
      },
      business_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reg_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gst_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
        allowNull: true
      },
      max_bookings: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable('service_provider_profiles');
  }
};
