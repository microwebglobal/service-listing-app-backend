"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("provider_service_categories", [
      {
        provider_id: 1,
        category_id: "CAT002",
        service_id: null,          
        item_id: null,             
        experience_years: 5,
        is_primary: true,
        price_adjustment: JSON.stringify({
          type: "multiplier",
          value: 1.0
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        category_id: "CAT003",
        service_id: "SRV001",      
        item_id: null,            
        experience_years: 3,
        is_primary: false,
        price_adjustment: null,    
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: 1,
        category_id: "CAT003",
        service_id: "SRV002",      // another specific service
        item_id: "ITEM001",        // specific item permission
        experience_years: 3,
        is_primary: false,
        price_adjustment: JSON.stringify({
          type: "fixed",
          value: 100
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provider_service_categories", null, {});
  },
};