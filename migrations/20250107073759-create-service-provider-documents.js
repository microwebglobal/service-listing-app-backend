"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_provider_documents", {
      document_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      document_type: {
        type: Sequelize.ENUM(
          "id_proof",
          "address_proof",
          "qualification_proof",
          "aadhar",
          "pan",
          "business_registration",
          "insurance",
          "service_certificate",
          "agreement",
          "terms_acceptance"
        ),
        allowNull: false,
      },
      document_url: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      verification_status: {
        type: Sequelize.ENUM("pending", "verified", "rejected"),
        defaultValue: "pending",
      },
      verification_notes: {
        type: Sequelize.TEXT,
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
      "service_provider_documents",
      ["provider_id", "document_type"],
      {
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_provider_documents");
  },
};
