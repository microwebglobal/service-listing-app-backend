"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("service_provider_documents", [
      {
        provider_id: 1,
        document_type: "id_proof",
        document_url: "https://example.com/id_proof_1.jpg",
        verification_status: "pending",
        verification_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        document_type: "business_registration",
        document_url: "https://example.com/business_reg_1.pdf",
        verification_status: "verified",
        verification_notes: "Verified successfully",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        document_type: "insurance",
        document_url: "https://example.com/insurance_2.pdf",
        verification_status: "pending",
        verification_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_documents", null, {});
  },
};
