"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First insert service items
    await queryInterface.bulkInsert(
      "service_items",
      [
        {
          item_id: "ITEM001",
          service_id: "SRV001",
          name: "Full Arms Wax",
          description: "Regular waxing for arms",
          duration_hours: 1,
          duration_minutes: 30,
          overview: "Regular waxing for arms",
          base_price: 299,
          advance_percentage: 0,
          is_home_visit: true,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          item_id: "ITEM002",
          service_id: "SRV002",
          name: "Full Legs Wax",
          description: "Regular waxing for legs",
          duration_hours: 1,
          duration_minutes: 30,
          overview: "Regular waxing for arms",
          base_price: 399,
          advance_percentage: 100,
          is_home_visit: false,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          item_id: "ITEM003",
          service_id: "SRV003",
          name: "Full Arms Rica Wax",
          description: "Premium Rica waxing for arms",
          duration_hours: 1,
          duration_minutes: 30,
          overview: "Regular waxing for arms",
          base_price: 499,
          advance_percentage: 20,
          is_home_visit: false,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Then insert city-specific pricing for service items
    await queryInterface.bulkInsert(
      "city_specific_pricing",
      [
        {
          city_id: "CTY001",
          item_id: "ITEM001",
          item_type: "service_item",
          price: 349,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          city_id: "CTY002",
          item_id: "ITEM001",
          item_type: "service_item",
          price: 299,
          created_at: new Date(),
          updated_at: new Date(),
        },
        // Add more city-specific pricing...
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "service_commissions",
      [
        {
          city_id: "CTY001",
          item_id: "ITEM001",
          item_type: "service_item",
          commission_rate: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          city_id: "CTY002",
          item_id: "ITEM001",
          item_type: "service_item",
          commission_rate: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "city_specific_pricing",
      { item_type: "service_item" },
      {}
    );
    await queryInterface.bulkDelete("service_items", null, {});
  },
};
