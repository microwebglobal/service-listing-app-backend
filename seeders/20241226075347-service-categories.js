"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingCategories = await queryInterface.sequelize.query(
      'SELECT category_id FROM "service_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingCategoryIds = new Set(existingCategories.map(cat => cat.category_id));
    
    const categoriesToInsert = [
      {
        category_id: "CAT001",
        name: "Salon for Women",
        slug: "salon-for-women",
        icon_url: "/uploads/images/salon_women_updated.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category_id: "CAT002",
        name: "AC & Appliance Repair",
        slug: "ac-appliance-repair",
        icon_url: "/uploads/images/ac_repair_updated.webp",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        category_id: "CAT003",
        name: "Wall Painting",
        slug: "wall-painting",
        icon_url: "/uploads/images/wall_painting_updated.webp",
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
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
      }
    ].filter(category => !existingCategoryIds.has(category.category_id));

    const cities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (categoriesToInsert.length > 0) {
      await queryInterface.bulkInsert("service_categories", categoriesToInsert);
    } else {
      console.log("All categories already exist, skipping insertion");
    }
    
    const existingRelationships = await queryInterface.sequelize.query(
      'SELECT category_id, city_id FROM "category_cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const relationshipKeys = new Set(existingRelationships.map(rel => `${rel.category_id}-${rel.city_id}`));
    
    const allCategories = await queryInterface.sequelize.query(
      'SELECT category_id FROM "service_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const categoryRelationships = [];
    
    allCategories.forEach(category => {
      cities.forEach(city => {
        const key = `${category.category_id}-${city.city_id}`;
        if (!relationshipKeys.has(key)) {
          categoryRelationships.push({
            category_id: category.category_id,
            city_id: city.city_id,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    });
    
    if (categoryRelationships.length > 0) {
      return queryInterface.bulkInsert("category_cities", categoryRelationships);
    } else {
      console.log("All category-city relationships already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("category_cities", null, {});
    await queryInterface.bulkDelete("service_categories", null, {});
  },
};