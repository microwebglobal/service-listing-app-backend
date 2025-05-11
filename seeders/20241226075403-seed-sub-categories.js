"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check existing sub-categories
    const existingSubCategories = await queryInterface.sequelize.query(
      'SELECT sub_category_id FROM "sub_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingSubCategoryIds = new Set(existingSubCategories.map(sc => sc.sub_category_id));
    
    // Prepare sub-categories to insert
    const subCategoriesToInsert = [
      {
        sub_category_id: "SCAT001",
        category_id: "CAT001",
        name: "Waxing",
        slug: "waxing",
        icon_url: "/uploads/images/waxing_updated.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT002",
        category_id: "CAT002",
        name: "AC Services",
        slug: "ac-services",
        icon_url: "/uploads/images/ac_services_updated.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT003",
        category_id: "CAT001",
        name: "Facials",
        slug: "facials",
        icon_url: "/uploads/images/facials.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT004",
        category_id: "CAT001",
        name: "Manicure & Pedicure",
        slug: "manicure-pedicure",
        icon_url: "/uploads/images/manicure.jpg",
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT005",
        category_id: "CAT002",
        name: "Refrigerator Repair",
        slug: "refrigerator-repair",
        icon_url: "/uploads/images/refrigerator.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT006",
        category_id: "CAT003",
        name: "Interior Painting",
        slug: "interior-painting",
        icon_url: "/uploads/images/interior-painting.jpg",
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT007",
        category_id: "CAT003",
        name: "Exterior Painting",
        slug: "exterior-painting",
        icon_url: "/uploads/images/exterior-painting.jpg",
        display_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        sub_category_id: "SCAT008",
        category_id: "CAT002",
        name: "Washing Machine Repair",
        slug: "washing-machine-repair",
        icon_url: "/uploads/images/washing-machine.jpg",
        display_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(subCategory => !existingSubCategoryIds.has(subCategory.sub_category_id));
    
    if (subCategoriesToInsert.length > 0) {
      return queryInterface.bulkInsert("sub_categories", subCategoriesToInsert);
    } else {
      console.log("All sub categories already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("sub_categories", null, {});
  },
};