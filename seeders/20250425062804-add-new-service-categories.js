"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // New categories
    await queryInterface.bulkInsert(
      "service_categories",
      [
        {
          category_id: "CAT004",
          name: "Home Cleaning",
          slug: "home-cleaning",
          icon_url: "/uploads/images/home-cleaning.jpg",
          display_order: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT005",
          name: "Pest Control",
          slug: "pest-control",
          icon_url: "/uploads/images/pest-control.jpg",
          display_order: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT006",
          name: "Electrician",
          slug: "electrician",
          icon_url: "/uploads/images/electrician.jpg",
          display_order: 6,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT007",
          name: "Plumbing",
          slug: "plumbing",
          icon_url: "/uploads/images/plumbing.jpg",
          display_order: 7,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT008",
          name: "Carpentry",
          slug: "carpentry",
          icon_url: "/uploads/images/carpentry.jpg",
          display_order: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // City-category relationships
    await queryInterface.bulkInsert(
      "category_cities",
      [
        // CAT004
        {
          category_id: "CAT004",
          city_id: "CTY001",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT004",
          city_id: "CTY002",
          created_at: new Date(),
          updated_at: new Date(),
        },
        // CAT005
        {
          category_id: "CAT005",
          city_id: "CTY001",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT005",
          city_id: "CTY002",
          created_at: new Date(),
          updated_at: new Date(),
        },
        // CAT006
        {
          category_id: "CAT006",
          city_id: "CTY001",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT006",
          city_id: "CTY002",
          created_at: new Date(),
          updated_at: new Date(),
        },
        // CAT007
        {
          category_id: "CAT007",
          city_id: "CTY001",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT007",
          city_id: "CTY002",
          created_at: new Date(),
          updated_at: new Date(),
        },
        // CAT008
        {
          category_id: "CAT008",
          city_id: "CTY001",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          category_id: "CAT008",
          city_id: "CTY002",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("category_cities", {
      category_id: {
        [Sequelize.Op.in]: ["CAT004", "CAT005", "CAT006", "CAT007", "CAT008"],
      },
    });
    await queryInterface.bulkDelete("service_categories", {
      category_id: {
        [Sequelize.Op.in]: ["CAT004", "CAT005", "CAT006", "CAT007", "CAT008"],
      },
    });
  },
};
