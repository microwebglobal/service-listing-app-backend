"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check for existing service items
    const existingItems = await queryInterface.sequelize.query(
      'SELECT item_id FROM "service_items"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingItemIds = new Set(existingItems.map(item => item.item_id));
    
    // Prepare service items to insert
    const serviceItemsToInsert = [
      {
        item_id: "ITEM001",
        service_id: "SRV001",
        name: "Full Arms Wax",
        description: "Regular waxing for arms that removes hair from the entire arm including the underarms.",
        duration_hours: 0,
        duration_minutes: 45,
        overview: "Our full arms waxing service uses premium quality wax that removes hair from the roots, giving you smooth skin for up to 3 weeks.",
        base_price: 299,
        advance_percentage: 0,
        is_home_visit: true,
        icon_url: "/uploads/images/arms_wax.jpg",
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        item_id: "ITEM002",
        service_id: "SRV002",
        name: "Full Legs Wax",
        description: "Regular waxing for legs that removes hair from thighs to ankles.",
        duration_hours: 1,
        duration_minutes: 0,
        overview: "Our full legs waxing service uses premium quality wax for smoother skin. Includes thighs, knees, and lower legs.",
        base_price: 399,
        advance_percentage: 0,
        is_home_visit: true,
        icon_url: "/uploads/images/legs_wax.jpg",
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        item_id: "ITEM003",
        service_id: "SRV003",
        name: "Full Arms Rica Wax",
        description: "Premium Rica waxing for arms using imported Italian wax.",
        duration_hours: 0,
        duration_minutes: 50,
        overview: "Rica waxing uses premium Italian wax enriched with natural ingredients for sensitive skin. Gives smoother, longer-lasting results than regular wax.",
        base_price: 499,
        advance_percentage: 0,
        is_home_visit: true,
        icon_url: "/uploads/images/rica_arms_wax.jpg",
        is_featured: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        item_id: "ITEM004",
        service_id: "SRV001",
        name: "Half Arms Wax",
        description: "Regular waxing for forearms only.",
        duration_hours: 0,
        duration_minutes: 30,
        overview: "Our half arms waxing service removes hair from the forearms using high-quality wax for smooth skin.",
        base_price: 199,
        advance_percentage: 0,
        is_home_visit: true,
        icon_url: "/uploads/images/half_arms_wax.jpg",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        item_id: "ITEM005",
        service_id: "SRV002",
        name: "Half Legs Wax",
        description: "Regular waxing for lower legs only.",
        duration_hours: 0,
        duration_minutes: 40,
        overview: "Our half legs waxing service removes hair from the knees down to the ankles, perfect for those who wear knee-length clothing.",
        base_price: 249,
        advance_percentage: 0,
        is_home_visit: true,
        icon_url: "/uploads/images/half_legs_wax.jpg",
        is_featured: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(item => !existingItemIds.has(item.item_id));
    
    // Insert service items
    if (serviceItemsToInsert.length > 0) {
      await queryInterface.bulkInsert("service_items", serviceItemsToInsert);
    } else {
      console.log("All service items already exist, skipping insertion");
    }
    
    // Check for existing city-specific pricing
    const existingPricing = await queryInterface.sequelize.query(
      'SELECT city_id, item_id FROM "city_specific_pricing" WHERE item_type = \'service_item\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const pricingKeys = new Set(existingPricing.map(p => `${p.city_id}-${p.item_id}`));
    
    // Prepare city-specific pricing to insert
    const pricingToInsert = [
      {
        city_id: "CTY001", // Mumbai
        item_id: "ITEM001",
        item_type: "service_item",
        price: 349,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002", // Delhi
        item_id: "ITEM001",
        item_type: "service_item",
        price: 299,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY003", // Bangalore
        item_id: "ITEM001",
        item_type: "service_item",
        price: 329,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY001", // Mumbai
        item_id: "ITEM002",
        item_type: "service_item",
        price: 449,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002", // Delhi
        item_id: "ITEM002",
        item_type: "service_item",
        price: 399,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY003", // Bangalore
        item_id: "ITEM002",
        item_type: "service_item",
        price: 429,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY001", // Mumbai
        item_id: "ITEM003",
        item_type: "service_item",
        price: 549,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002", // Delhi
        item_id: "ITEM003",
        item_type: "service_item",
        price: 499,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY003", // Bangalore
        item_id: "ITEM003",
        item_type: "service_item",
        price: 529,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(pricing => !pricingKeys.has(`${pricing.city_id}-${pricing.item_id}`));
    
    // Insert city-specific pricing
    if (pricingToInsert.length > 0) {
      await queryInterface.bulkInsert("city_specific_pricing", pricingToInsert);
    } else {
      console.log("All city-specific pricing already exists, skipping insertion");
    }
    
    // Check for existing service commissions
    const existingCommissions = await queryInterface.sequelize.query(
      'SELECT city_id, item_id FROM "service_commissions" WHERE item_type = \'service_item\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const commissionKeys = new Set(existingCommissions.map(c => `${c.city_id}-${c.item_id}`));
    
    // Prepare service commissions to insert
    const commissionsToInsert = [
      {
        city_id: "CTY001", // Mumbai
        item_id: "ITEM001",
        item_type: "service_item",
        commission_rate: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002", // Delhi
        item_id: "ITEM001",
        item_type: "service_item",
        commission_rate: 12,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY003", // Bangalore
        item_id: "ITEM001",
        item_type: "service_item",
        commission_rate: 13,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY001", // Mumbai
        item_id: "ITEM002",
        item_type: "service_item",
        commission_rate: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY002", // Delhi
        item_id: "ITEM002",
        item_type: "service_item",
        commission_rate: 12,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        city_id: "CTY003", // Bangalore
        item_id: "ITEM002",
        item_type: "service_item",
        commission_rate: 13,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(commission => !commissionKeys.has(`${commission.city_id}-${commission.item_id}`));
    
    // Insert service commissions
    if (commissionsToInsert.length > 0) {
      await queryInterface.bulkInsert("service_commissions", commissionsToInsert);
    } else {
      console.log("All service commissions already exist, skipping insertion");
    }
    
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("service_commissions", { item_type: "service_item" }, {});
    await queryInterface.bulkDelete("city_specific_pricing", { item_type: "service_item" }, {});
    await queryInterface.bulkDelete("service_items", null, {});
  },
};