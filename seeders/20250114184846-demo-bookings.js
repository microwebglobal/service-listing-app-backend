'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sample bookings
    const bookings = [
      {
        booking_id: 'BK-20250115-001',
        user_id: 1, // Assuming user exists
        provider_id: 1, // Assuming provider exists
        city_id: 'CTY002', // Assuming city exists
        booking_date: '2025-01-20',
        start_time: '11:00:00',
        end_time: '13:00:00',
        status: 'confirmed',
        service_address: '123 Main St, Bangalore',
        service_location: Sequelize.literal('ST_GeomFromText(\'POINT(77.5946 12.9716)\')'),
        customer_notes: 'Please bring eco-friendly cleaning supplies',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        booking_id: 'BK-20250115-002',
        user_id: 2,
        provider_id: 1,
        city_id: 'CTY002',
        booking_date: '2025-01-21',
        start_time: '14:00:00',
        end_time: '15:30:00',
        status: 'confirmed',
        service_address: '456 Park Avenue, Bangalore',
        service_location: Sequelize.literal('ST_GeomFromText(\'POINT(77.6010 12.9766)\')'),
        customer_notes: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('bookings', bookings, {});

    // Sample booking items
    const bookingItems = [
      {
        booking_id: 'BK-20250115-001',
        item_id: 'ITEM001', // Assuming service item exists
        item_type: 'service_item',
        quantity: 1,
        unit_price: 1200.00,
        total_price: 1200.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        booking_id: 'BK-20250115-001',
        item_id: 'PITEM008', // Assuming package item exists
        item_type: 'package_item',
        quantity: 2,
        unit_price: 800.00,
        total_price: 1600.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('booking_items', bookingItems, {});

    // Sample booking payments
    const bookingPayments = [
      {
        payment_id: 'PY-20250115-001',
        booking_id: 'BK-20250115-001',
        subtotal: 2800.00,
        tip_amount: 200.00,
        tax_amount: 504.00, // 18% tax
        total_amount: 3504.00,
        payment_method: 'upi',
        payment_status: 'completed',
        transaction_id: 'TXN123456',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        payment_id: 'PY-20250115-002',
        booking_id: 'BK-20250115-002',
        subtotal: 1500.00,
        tip_amount: 150.00,
        tax_amount: 270.00,
        total_amount: 1920.00,
        payment_method: 'card',
        payment_status: 'completed',
        transaction_id: 'TXN123457',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('booking_payments', bookingPayments, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('booking_payments', null, {});
    await queryInterface.bulkDelete('booking_items', null, {});
    await queryInterface.bulkDelete('bookings', null, {});
  }
};