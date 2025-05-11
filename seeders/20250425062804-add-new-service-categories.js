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
    ].filter(category => !existingCategoryIds.has(category.category_id));
    
    if (categoriesToInsert.length === 0) {
      console.log("All categories already exist, skipping insertion");
      return Promise.resolve();
    }
    
    await queryInterface.bulkInsert("service_categories", categoriesToInsert);

   
    const existingRelationships = await queryInterface.sequelize.query(
      'SELECT category_id, city_id FROM "category_cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const relationshipKeys = new Set(existingRelationships.map(rel => `${rel.category_id}-${rel.city_id}`));
    
    // Get cities
    const cities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities" ORDER BY city_id LIMIT 10',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const relationshipsToInsert = [];
    
    for (const category of categoriesToInsert) {
      for (const city of cities) {
        const key = `${category.category_id}-${city.city_id}`;
        if (!relationshipKeys.has(key)) {
          relationshipsToInsert.push({
            category_id: category.category_id,
            city_id: city.city_id,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    
    if (relationshipsToInsert.length === 0) {
      console.log("No new category-city relationships to insert");
      return Promise.resolve();
    }
    
    return queryInterface.bulkInsert("category_cities", relationshipsToInsert);
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