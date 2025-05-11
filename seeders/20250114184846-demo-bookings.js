"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if bookings already exist
    const existingBookings = await queryInterface.sequelize.query(
      'SELECT booking_id FROM "bookings"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (existingBookings.length > 0) {
      console.log("Bookings already exist, skipping insertion");
      return Promise.resolve();
    }
    
    // Get customers, providers, and cities
    const users = await queryInterface.sequelize.query(
      'SELECT u_id, role FROM "users" WHERE role = \'customer\' LIMIT 2',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      console.log("No customer users found, skipping bookings");
      return Promise.resolve();
    }
    
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_providers" LIMIT 3',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (providers.length === 0) {
      console.log("No providers found, skipping bookings");
      return Promise.resolve();
    }
    
    const employees = await queryInterface.sequelize.query(
      'SELECT employee_id, provider_id FROM "service_provider_employees" LIMIT 2',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const cities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities" LIMIT 3',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (cities.length === 0) {
      console.log("No cities found, skipping bookings");
      return Promise.resolve();
    }
    
    const serviceItems = await queryInterface.sequelize.query(
      'SELECT item_id, base_price FROM "service_items" LIMIT 3',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (serviceItems.length === 0) {
      console.log("No service items found, skipping bookings");
      return Promise.resolve();
    }
    
    // Log data for debugging
    console.log("Users:", users.map(u => u.u_id));
    console.log("Providers:", providers.map(p => p.provider_id));
    console.log("Cities:", cities.map(c => c.city_id));
    console.log("Service items:", serviceItems.map(s => ({id: s.item_id, price: s.base_price})));
    
    // Use the valid status values directly from migrations
    const validStatuses = [
      'cart', 
      'payment_pending', 
      'confirmed', 
      'assigned', 
      'accepted', 
      'in_progress', 
      'completed', 
      'cancelled', 
      'refunded'
    ];
    
    console.log("Using status values:", validStatuses);
    
    // Sample bookings with explicit values (no calculations that might result in NaN)
    const bookings = [
      {
        booking_id: "BK-20250515-001",
        user_id: users[0].u_id,
        provider_id: providers[0].provider_id,
        employee_id: employees.length > 0 ? employees[0].employee_id : null,
        city_id: cities[0].city_id,
        booking_date: "2025-05-20",
        start_time: "11:00:00",
        end_time: "13:00:00",
        status: "confirmed",
        service_address: "123 Andheri East, Mumbai, Maharashtra",
        service_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(72.8777 19.0760)"
        ),
        customer_notes: "Please bring eco-friendly products",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-002",
        user_id: users[0].u_id,
        provider_id: providers.length > 1 ? providers[1].provider_id : providers[0].provider_id,
        employee_id: null,
        city_id: cities.length > 1 ? cities[1].city_id : cities[0].city_id,
        booking_date: "2025-05-21",
        start_time: "14:00:00",
        end_time: "15:30:00",
        status: "confirmed",
        service_address: "456 Karol Bagh, Delhi",
        service_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(77.1025 28.7041)"
        ),
        customer_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("bookings", bookings, {});

    // Set fixed prices to avoid NaN
    const price1 = serviceItems[0] && typeof serviceItems[0].base_price === 'number' ? 
                   serviceItems[0].base_price : 299;
    const price2 = serviceItems.length > 1 && typeof serviceItems[1].base_price === 'number' ? 
                   serviceItems[1].base_price : 399;
    
    // Sample booking items with fixed values
    const bookingItems = [
      {
        booking_id: "BK-20250515-001",
        item_id: serviceItems[0].item_id,
        item_type: "service_item",
        quantity: 1,
        unit_price: price1,
        total_price: price1,
        advance_payment: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-002",
        item_id: serviceItems.length > 1 ? serviceItems[1].item_id : serviceItems[0].item_id,
        item_type: "service_item",
        quantity: 1,
        unit_price: price2,
        total_price: price2,
        advance_payment: 0,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("booking_items", bookingItems, {});

    // Sample booking payments with fixed values
    const tax1 = Math.round(price1 * 0.18);
    const tax2 = Math.round(price2 * 0.18);
    
    const bookingPayments = [
      {
        payment_id: "PY-20250515-001",
        booking_id: "BK-20250515-001",
        subtotal: price1,
        advance_payment: 0,
        tip_amount: 200,
        tax_amount: tax1,
        total_amount: price1 + tax1 + 200,
        payment_method: "upi",
        payment_status: "completed",
        transaction_id: "TXN123456",
        commition_status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        payment_id: "PY-20250515-002",
        booking_id: "BK-20250515-002",
        subtotal: price2,
        tip_amount: 150,
        tax_amount: tax2,
        total_amount: price2 + tax2 + 150,
        advance_payment: 0,
        payment_method: "card",
        payment_status: "completed",
        transaction_id: "TXN123457",
        commition_status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("booking_payments", bookingPayments, {});
    
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("booking_payments", null, {});
    await queryInterface.bulkDelete("booking_items", null, {});
    await queryInterface.bulkDelete("bookings", null, {});
  },
};