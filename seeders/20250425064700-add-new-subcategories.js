"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("sub_categories", [
      // Home Cleaning - CAT004
      {
        sub_category_id: "SCAT009",
        category_id: "CAT004",
        name: "Bathroom Cleaning",
        slug: "bathroom-cleaning",
        icon_url: "/uploads/images/bathroom-cleaning.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT010",
        category_id: "CAT004",
        name: "Sofa Cleaning",
        slug: "sofa-cleaning",
        icon_url: "/uploads/images/sofa-cleaning.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Pest Control - CAT005
      {
        sub_category_id: "SCAT011",
        category_id: "CAT005",
        name: "Cockroach Control",
        slug: "cockroach-control",
        icon_url: "/uploads/images/cockroach-control.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT012",
        category_id: "CAT005",
        name: "Bed Bug Control",
        slug: "bed-bug-control",
        icon_url: "/uploads/images/bed-bug-control.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Electrician - CAT006
      {
        sub_category_id: "SCAT013",
        category_id: "CAT006",
        name: "Fan Installation",
        slug: "fan-installation",
        icon_url: "/uploads/images/fan-installation.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT014",
        category_id: "CAT006",
        name: "Switchboard Repair",
        slug: "switchboard-repair",
        icon_url: "/uploads/images/switchboard-repair.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Plumbing - CAT007
      {
        sub_category_id: "SCAT015",
        category_id: "CAT007",
        name: "Tap Repair",
        slug: "tap-repair",
        icon_url: "/uploads/images/tap-repair.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT016",
        category_id: "CAT007",
        name: "Water Pipe Fixing",
        slug: "water-pipe-fixing",
        icon_url: "/uploads/images/water-pipe-fixing.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Carpentry - CAT008
      {
        sub_category_id: "SCAT017",
        category_id: "CAT008",
        name: "Furniture Repair",
        slug: "furniture-repair",
        icon_url: "/uploads/images/furniture-repair.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT018",
        category_id: "CAT008",
        name: "Door Lock Fixing",
        slug: "door-lock-fixing",
        icon_url: "/uploads/images/door-lock-fixing.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("sub_categories", {
      sub_category_id: {
        [Sequelize.Op.in]: [
          "SCAT009",
          "SCAT010",
          "SCAT011",
          "SCAT012",
          "SCAT013",
          "SCAT014",
          "SCAT015",
          "SCAT016",
          "SCAT017",
          "SCAT018",
        ],
      },
    });
  },
};
