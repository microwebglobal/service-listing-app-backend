"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if enquiries exist
    const enquiries = await queryInterface.sequelize.query(
      'SELECT enquiry_id FROM "service_provider_enquiries"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (enquiries.length === 0) {
      console.log("No enquiries found, skipping enquiry service categories");
      return Promise.resolve();
    }
    
    // Check if categories exist
    const categories = await queryInterface.sequelize.query(
      'SELECT category_id FROM "service_categories" LIMIT 5',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (categories.length === 0) {
      console.log("No categories found, skipping enquiry service categories");
      return Promise.resolve();
    }
    
    // Check existing mappings
    const existingMappings = await queryInterface.sequelize.query(
      'SELECT enquiry_id, category_id FROM "enquiry_service_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const mappingKeys = new Set(existingMappings.map(m => `${m.enquiry_id}-${m.category_id}`));
    
    // Create mappings
    const mappingsToInsert = [];
    
    // First enquiry - map to categories 1 and 2
    if (enquiries.length > 0 && categories.length > 0) {
      const key1 = `${enquiries[0].enquiry_id}-${categories[0].category_id}`;
      if (!mappingKeys.has(key1)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[0].enquiry_id,
          category_id: categories[0].category_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      
      if (categories.length > 1) {
        const key2 = `${enquiries[0].enquiry_id}-${categories[1].category_id}`;
        if (!mappingKeys.has(key2)) {
          mappingsToInsert.push({
            enquiry_id: enquiries[0].enquiry_id,
            category_id: categories[1].category_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    
    // Second enquiry - map to category 3
    if (enquiries.length > 1 && categories.length > 2) {
      const key3 = `${enquiries[1].enquiry_id}-${categories[2].category_id}`;
      if (!mappingKeys.has(key3)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[1].enquiry_id,
          category_id: categories[2].category_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    // Third enquiry - map to categories 1 and 4
    if (enquiries.length > 2 && categories.length > 0) {
      const key4 = `${enquiries[2].enquiry_id}-${categories[0].category_id}`;
      if (!mappingKeys.has(key4)) {
        mappingsToInsert.push({
          enquiry_id: enquiries[2].enquiry_id,
          category_id: categories[0].category_id,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      
      if (categories.length > 3) {
        const key5 = `${enquiries[2].enquiry_id}-${categories[3].category_id}`;
        if (!mappingKeys.has(key5)) {
          mappingsToInsert.push({
            enquiry_id: enquiries[2].enquiry_id,
            category_id: categories[3].category_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    
    if (mappingsToInsert.length > 0) {
      return queryInterface.bulkInsert("enquiry_service_categories", mappingsToInsert);
    } else {
      console.log("All enquiry service categories already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("enquiry_service_categories", null, {});
  },
};