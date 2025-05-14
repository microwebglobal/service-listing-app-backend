"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if buffer times already exist
    const existingBufferTimes = await queryInterface.sequelize.query(
      'SELECT id FROM "city_specific_buffertime"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (existingBufferTimes.length > 0) {
      console.log("Buffer times already exist, skipping insertion");
      return Promise.resolve();
    }
    
    // Get service items
    const serviceItems = await queryInterface.sequelize.query(
      'SELECT item_id FROM "service_items" LIMIT 5',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (serviceItems.length === 0) {
      console.log("No service items found, skipping buffer times");
      return Promise.resolve();
    }
    
    // Preparing buffer times for insertion
    const bufferTimes = [
      // Mumbai - Full Arms Wax
      {
        city_id: "CTY001", // Mumbai
        item_id: serviceItems[0].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Delhi - Full Arms Wax
      {
        city_id: "CTY002", // Delhi
        item_id: serviceItems[0].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Bangalore - Full Arms Wax
      {
        city_id: "CTY003", // Bangalore
        item_id: serviceItems[0].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Mumbai - Full Legs Wax
      {
        city_id: "CTY001", // Mumbai
        item_id: serviceItems[1].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Delhi - Full Legs Wax
      {
        city_id: "CTY002", // Delhi
        item_id: serviceItems[1].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 40,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Bangalore - Full Legs Wax
      {
        city_id: "CTY003", // Bangalore
        item_id: serviceItems[1].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Mumbai - Full Arms Rica Wax
      {
        city_id: "CTY001", // Mumbai
        item_id: serviceItems[2].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Delhi - Full Arms Rica Wax
      {
        city_id: "CTY002", // Delhi
        item_id: serviceItems[2].item_id,
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 25,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];
    
    return queryInterface.bulkInsert("city_specific_buffertime", bufferTimes);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("city_specific_buffertime", null, {});
  },
};