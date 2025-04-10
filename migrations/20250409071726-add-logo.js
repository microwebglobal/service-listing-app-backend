'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_service_provider_documents_document_type ADD VALUE 'logo';
    `);
  },

  async down(queryInterface, Sequelize) {
  }
};
