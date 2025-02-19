"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("city_specific_buffertime", [
      {
        city_id: "CTY001",
        item_id: "ITEM001",
        item_type: "service_item",
        buffer_hours: 1,
        buffer_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002",
        item_id: "ITEM001",
        item_type: "service_item",
        buffer_hours: 2,
        buffer_minutes: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY001",
        item_id: "ITEM002",
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002",
        item_id: "ITEM002",
        item_type: "service_item",
        buffer_hours: 0,
        buffer_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("city_specific_buffertime", null, {});
  },
};
