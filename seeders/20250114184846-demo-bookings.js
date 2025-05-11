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
      'SELECT u_id, role FROM "users" WHERE role = \'customer\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const employees = await queryInterface.sequelize.query(
      'SELECT employee_id, provider_id FROM "service_provider_employees"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const cities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const serviceItems = await queryInterface.sequelize.query(
      'SELECT item_id, base_price FROM "service_items"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0 || providers.length === 0 || cities.length === 0 || serviceItems.length === 0) {
      console.log("Missing required data for bookings, skipping insertion");
      return Promise.resolve();
    }
    
    // Sample bookings
    const bookings = [
      {
        booking_id: "BK-20250515-001",
        user_id: users[0].u_id,
        provider_id: providers[0].provider_id,
        employee_id: employees.length > 0 ? employees[0].employee_id : null,
        city_id: cities[0].city_id, // Mumbai
        booking_date: "2025-05-20",
        start_time: "11:00:00",
        end_time: "13:00:00",
        status: "confirmed",
        service_address: "123 Andheri East, Mumbai, Maharashtra",
        service_location: Sequelize.literal(
          "ST_GeomFromText('POINT(72.8777 19.0760)')"
        ),
        customer_notes: "Please bring eco-friendly products",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-002",
        user_id: users[0].u_id,
        provider_id: providers[1].provider_id,
        employee_id: null,
        city_id: cities[1].city_id, // Delhi
        booking_date: "2025-05-21",
        start_time: "14:00:00",
        end_time: "15:30:00",
        status: "confirmed",
        service_address: "456 Karol Bagh, Delhi",
        service_location: Sequelize.literal(
          "ST_GeomFromText('POINT(77.1025 28.7041)')"
        ),
        customer_notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-003",
        user_id: users.length > 1 ? users[1].u_id : users[0].u_id,
        provider_id: providers[2] ? providers[2].provider_id : providers[0].provider_id,
        employee_id: null,
        city_id: cities[2] ? cities[2].city_id : cities[0].city_id, // Bangalore or Mumbai
        booking_date: "2025-05-25",
        start_time: "10:00:00",
        end_time: "12:00:00",
        status: "pending",
        service_address: "789 Indiranagar, Bangalore, Karnataka",
        service_location: Sequelize.literal(
          "ST_GeomFromText('POINT(77.5946 12.9716)')"
        ),
        customer_notes: "Call before arriving",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("bookings", bookings, {});

    // Sample booking items
    const bookingItems = [
      {
        booking_id: "BK-20250515-001",
        item_id: serviceItems[0].item_id, // First service item
        item_type: "service_item",
        quantity: 1,
        unit_price: serviceItems[0].base_price,
        total_price: serviceItems[0].base_price,
        advance_payment: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-001",
        item_id: serviceItems[1].item_id, // Second service item
        item_type: "service_item",
        quantity: 1,
        unit_price: serviceItems[1].base_price,
        total_price: serviceItems[1].base_price,
        advance_payment: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-002",
        item_id: serviceItems[2].item_id, // Third service item
        item_type: "service_item",
        quantity: 1,
        unit_price: serviceItems[2].base_price,
        total_price: serviceItems[2].base_price,
        advance_payment: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        booking_id: "BK-20250515-003",
        item_id: serviceItems[0].item_id, // First service item
        item_type: "service_item",
        quantity: 2,
        unit_price: serviceItems[0].base_price,
        total_price: serviceItems[0].base_price * 2,
        advance_payment: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await queryInterface.bulkInsert("booking_items", bookingItems, {});

    // Sample booking payments
    const bookingPayments = [
      {
        payment_id: "PY-20250515-001",
        booking_id: "BK-20250515-001",
        subtotal: serviceItems[0].base_price + serviceItems[1].base_price,
        advance_payment: 0.0,
        tip_amount: 200.0,
        tax_amount: Math.round((serviceItems[0].base_price + serviceItems[1].base_price) * 0.18), // 18% GST
        total_amount: (serviceItems[0].base_price + serviceItems[1].base_price) * 1.18 + 200,
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
        subtotal: serviceItems[2].base_price,
        tip_amount: 150.0,
        tax_amount: Math.round(serviceItems[2].base_price * 0.18),
        total_amount: serviceItems[2].base_price * 1.18 + 150,
        advance_payment: 0.0,
        payment_method: "card",
        payment_status: "completed",
        transaction_id: "TXN123457",
        commition_status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        payment_id: "PY-20250515-003",
        booking_id: "BK-20250515-003",
        subtotal: serviceItems[0].base_price * 2,
        tip_amount: 0.0,
        tax_amount: Math.round(serviceItems[0].base_price * 2 * 0.18),
        total_amount: serviceItems[0].base_price * 2 * 1.18,
        advance_payment: 0.0,
        payment_method: "pending",
        payment_status: "pending",
        transaction_id: null,
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