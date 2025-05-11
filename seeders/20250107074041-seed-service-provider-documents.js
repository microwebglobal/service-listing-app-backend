"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get existing providers
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (providers.length === 0) {
      console.log("No providers found, skipping document insertion");
      return Promise.resolve();
    }
    
    // Check existing documents
    const existingDocs = await queryInterface.sequelize.query(
      'SELECT provider_id, document_type FROM "service_provider_documents"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const docKeys = new Set(existingDocs.map(doc => `${doc.provider_id}-${doc.document_type}`));
    
    // Create documents for the first provider
    const docsToInsert = [
      {
        provider_id: providers[0].provider_id,
        document_type: "id_proof",
        document_url: "https://example.com/id_proof_1.jpg",
        verification_status: "verified",
        verification_notes: "ID verified successfully",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providers[0].provider_id,
        document_type: "business_registration",
        document_url: "https://example.com/business_reg_1.pdf",
        verification_status: "verified",
        verification_notes: "Business registration verified",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providers[0].provider_id,
        document_type: "logo",
        document_url: "https://example.com/logo_1.png",
        verification_status: "verified",
        verification_notes: "Logo approved",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(doc => !docKeys.has(`${doc.provider_id}-${doc.document_type}`));
    
    // Add documents for the second provider if available
    if (providers.length > 1) {
      const provider2Docs = [
        {
          provider_id: providers[1].provider_id,
          document_type: "id_proof",
          document_url: "https://example.com/id_proof_2.jpg",
          verification_status: "verified",
          verification_notes: "ID verified successfully",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          provider_id: providers[1].provider_id,
          document_type: "aadhar",
          document_url: "https://example.com/aadhar_2.pdf",
          verification_status: "verified",
          verification_notes: "Aadhar verified",
          created_at: new Date(),
          updated_at: new Date(),
        }
      ].filter(doc => !docKeys.has(`${doc.provider_id}-${doc.document_type}`));
      
      docsToInsert.push(...provider2Docs);
    }
    
    // Add documents for the third provider if available
    if (providers.length > 2) {
      const provider3Docs = [
        {
          provider_id: providers[2].provider_id,
          document_type: "id_proof",
          document_url: "https://example.com/id_proof_3.jpg",
          verification_status: "verified",
          verification_notes: "ID verified successfully",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          provider_id: providers[2].provider_id,
          document_type: "logo",
          document_url: "https://example.com/logo_3.png",
          verification_status: "pending",
          verification_notes: "Logo under review",
          created_at: new Date(),
          updated_at: new Date(),
        }
      ].filter(doc => !docKeys.has(`${doc.provider_id}-${doc.document_type}`));
      
      docsToInsert.push(...provider3Docs);
    }
    
    if (docsToInsert.length > 0) {
      return queryInterface.bulkInsert("service_provider_documents", docsToInsert);
    } else {
      console.log("All provider documents already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_documents", null, {});
  },
};