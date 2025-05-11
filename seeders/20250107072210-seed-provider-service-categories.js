"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingRelationships = await queryInterface.sequelize.query(
      'SELECT provider_id, category_id, service_id FROM "provider_service_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const relationshipKeys = new Set(existingRelationships.map(rel => 
      `${rel.provider_id}-${rel.category_id}-${rel.service_id || 'null'}`
    ));
    
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const providerMap = new Map(providers.map(p => [p.user_id, p.provider_id]));
    
    const servicesToInsert = [
      // Raj Home Solutions - Wall Painting
      {
        provider_id: providerMap.get(2),
        category_id: "CAT003", // Wall Painting
        service_id: null,
        item_id: null,
        experience_years: 8,
        is_primary: true,
        price_adjustment: JSON.stringify({
          type: "multiplier",
          value: 1.0
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Raj Home Solutions - Home Cleaning
      {
        provider_id: providerMap.get(2),
        category_id: "CAT004", // Home Cleaning
        service_id: null,
        item_id: null,
        experience_years: 5,
        is_primary: false,
        price_adjustment: null,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Deepak - AC Repair
      {
        provider_id: providerMap.get(5),
        category_id: "CAT002", // AC & Appliance Repair
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
      // Kavita - Salon for Women
      {
        provider_id: providerMap.get(8),
        category_id: "CAT001", // Salon for Women
        service_id: "SRV001", // Arms Waxing
        item_id: null,
        experience_years: 12,
        is_primary: true,
        price_adjustment: JSON.stringify({
          type: "multiplier",
          value: 1.0
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Kavita - Salon for Women (specific service)
      {
        provider_id: providerMap.get(8),
        category_id: "CAT001", // Salon for Women
        service_id: "SRV002", // Legs Waxing
        item_id: "ITEM002", // Full Legs Wax
        experience_years: 12,
        is_primary: false,
        price_adjustment: JSON.stringify({
          type: "fixed",
          value: -50 // Discount
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(service => {
      const key = `${service.provider_id}-${service.category_id}-${service.service_id || 'null'}`;
      return service.provider_id && !relationshipKeys.has(key);
    });
    
    if (servicesToInsert.length > 0) {
      return queryInterface.bulkInsert("provider_service_categories", servicesToInsert);
    } else {
      console.log('All provider service categories already exist, skipping insertion');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provider_service_categories", null, {});
  },
};