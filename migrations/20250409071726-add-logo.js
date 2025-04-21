"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_service_provider_documents_document_type') THEN
          ALTER TYPE enum_service_provider_documents_document_type ADD VALUE 'logo';
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {},
};
