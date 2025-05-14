"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingRelationships = await queryInterface.sequelize.query(
      'SELECT provider_id, city_id FROM "provider_service_cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const relationshipKeys = new Set(existingRelationships.map(rel => `${rel.provider_id}-${rel.city_id}`));
    
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const providerMap = new Map(providers.map(p => [p.user_id, p.provider_id]));
    
    const citiesToInsert = [
      {
        provider_id: providerMap.get(2),
        city_id: "CTY001", // Mumbai
        service_radius: 15.0,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providerMap.get(2),
        city_id: "CTY002", // Delhi
        service_radius: 12.0,
        is_primary: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providerMap.get(5),
        city_id: "CTY002", // Delhi
        service_radius: 10.0,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providerMap.get(5),
        city_id: "CTY001", // Mumbai
        service_radius: 8.0,
        is_primary: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providerMap.get(8),
        city_id: "CTY003", // Bangalore
        service_radius: 8.0,
        is_primary: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        provider_id: providerMap.get(8),
        city_id: "CTY004", // Chennai
        service_radius: 10.0,
        is_primary: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(city => {
      const key = `${city.provider_id}-${city.city_id}`;
      return city.provider_id && !relationshipKeys.has(key);
    });
    
    if (citiesToInsert.length > 0) {
      return queryInterface.bulkInsert("provider_service_cities", citiesToInsert);
    } else {
      console.log('All provider service cities already exist, skipping insertion');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("provider_service_cities", null, {});
  },
};