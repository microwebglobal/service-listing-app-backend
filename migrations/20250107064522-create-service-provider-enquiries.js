"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_provider_enquiries", {
      enquiry_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      business_type: {
        type: Sequelize.ENUM("individual", "business"),
        allowNull: false,
      },
      business_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      primary_location: {
        type: Sequelize.GEOMETRY("POINT"),
        allowNull: false,
        comment: "Main operating location",
      },
      skills: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      registration_link: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      registration_link_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_provider_enquiries");
  },
};
