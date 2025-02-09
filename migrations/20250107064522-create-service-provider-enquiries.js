"use strict";

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
        unique: true
      },
      business_type: {
        type: Sequelize.ENUM("individual", "business"),
        allowNull: false,
      },
      business_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      business_website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      number_of_employees: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      authorized_person_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      authorized_person_contact: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      years_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      primary_location: {
        type: Sequelize.GEOMETRY("POINT"),
        allowNull: false,
      },
      skills: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected","completed"),
        defaultValue: "pending",
      },
      gender: {
        type: Sequelize.ENUM("Male","Female","Other"),
        allowNull: true,
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

    await queryInterface.addIndex(
      'service_provider_enquiries',
      ['business_name'],
      {
        unique: true,
        where: {
          business_type: 'business'
        },
        name: 'unique_business_name'
      }
    );

    await queryInterface.addIndex(
      'service_provider_enquiries',
      ['user_id'],
      {
        unique: true,
        name: 'unique_user_enquiry'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('service_provider_enquiries', 'unique_business_name');
    await queryInterface.removeIndex('service_provider_enquiries', 'unique_user_enquiry');
    await queryInterface.dropTable("service_provider_enquiries");
  },
};