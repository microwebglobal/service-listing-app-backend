"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "services",
      [
        {
          service_id: "SRV001",
          type_id: "TYPE001",
          name: "Arms Waxing",
          description: "Regular waxing services for arms",
          display_order: 1,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          service_id: "SRV002",
          type_id: "TYPE001",
          name: "Legs Waxing",
          description: "Regular waxing services for legs",
          display_order: 2,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          service_id: "SRV003",
          type_id: "TYPE002",
          name: "Arms Rica Waxing",
          description: "Premium Rica waxing services for arms",
          display_order: 1,
          icon_url: "/uploads/images/1735813069408.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("services", null, {});
  },
};
