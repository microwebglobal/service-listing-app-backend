"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("service_providers", {
      provider_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
      },
      enquiry_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
        model: 'service_provider_enquiries',
        key: 'enquiry_id'
        },
      },
      business_type: {
        type: Sequelize.ENUM("individual", "business"),
        allowNull: false,
      },
      business_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      business_registration_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      primary_location: {
        type: Sequelize.GEOMETRY("POINT"),
        allowNull: false,
      },
      service_radius: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      availability_type: {
        type: Sequelize.ENUM("full_time", "part_time"),
        allowNull: false,
      },
      availability_hours: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specializations: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      qualification: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      profile_bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      languages_spoken: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      social_media_links: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.ENUM("upi", "bank"),
        allowNull: false,
      },
      payment_details: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "pending_approval",
          "active",
          "suspended",
          "inactive",
          "rejected"
        ),
        defaultValue: "pending_approval",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("service_providers");
  },
};
