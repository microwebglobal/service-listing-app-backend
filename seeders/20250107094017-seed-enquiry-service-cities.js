"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if enquiries exist
    const enquiries = await queryInterface.sequelize.query(
      'SELECT enquiry_id FROM "service_provider_enquiries"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (enquiries.length === 0) {
      console.log("No enquiries found, skipping enquiry service cities");
      return Promise.resolve();
    }
    
    // Check if cities exist
    const cities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities" LIMIT 5',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (cities.length === 0) {
      console.log("No cities found, skipping enquiry service cities");
      return Promise.resolve();
    }
    
    // Check existing mappings
    const existingMappings = await queryInterface.sequelize.query(
      'SELECT enquiry_id, city_id FROM "enquiry_service_cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const mappingKeys = new Set(existingMappings.map(m => `${m.enquiry_id}-${m.city_id}`));
    
    // Create mappings
    const mappingsToInsert = [];
    
    // First enquiry - map to Mumbai and Delhi
    if (enquiries.length > 0 && cities.length > 1) {
      const key1 = `${enquiries[0].enquiry_id}-${cities[0].city_id}`;
      if (!mappingKeys.has(key1)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[0].enquiry_id,
          city_id: cities[0].city_id, // Mumbai
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      
      const key2 = `${enquiries[0].enquiry_id}-${cities[1].city_id}`;
      if (!mappingKeys.has(key2)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[0].enquiry_id,
          city_id: cities[1].city_id, // Delhi
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    // Second enquiry - map to Mumbai
    if (enquiries.length > 1 && cities.length > 0) {
      const key3 = `${enquiries[1].enquiry_id}-${cities[0].city_id}`;
      if (!mappingKeys.has(key3)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[1].enquiry_id,
          city_id: cities[0].city_id, // Mumbai
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    // Third enquiry - map to Bangalore and Chennai
    if (enquiries.length > 2 && cities.length > 3) {
      const key4 = `${enquiries[2].enquiry_id}-${cities[2].city_id}`;
      if (!mappingKeys.has(key4)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[2].enquiry_id,
          city_id: cities[2].city_id, // Bangalore
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      
      const key5 = `${enquiries[2].enquiry_id}-${cities[3].city_id}`;
      if (!mappingKeys.has(key5)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[2].enquiry_id,
          city_id: cities[3].city_id, // Chennai
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    if (mappingsToInsert.length > 0) {
      return queryInterface.bulkInsert("enquiry_service_cities", mappingsToInsert);
    } else {
      console.log("All enquiry service cities already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("enquiry_service_cities", null, {});
  },
};