// Migrations
// YYYYMMDDHHMMSS-create-bookings.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      booking_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'u_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'service_providers',
          key: 'provider_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'city_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'cart',
          'payment_pending',
          'confirmed',
          'assigned',
          'in_progress',
          'completed',
          'cancelled',
          'refunded'
        ),
        defaultValue: 'cart'
      },
      service_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      service_location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false
      },
      customer_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelled_by: {
        type: Sequelize.ENUM('customer', 'provider', 'admin'),
        allowNull: true
      },
      cancellation_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['provider_id']);
    await queryInterface.addIndex('bookings', ['city_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['booking_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookings');
  }
};

// YYYYMMDDHHMMSS-create-booking-items.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('booking_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      booking_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'booking_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      item_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      item_type: {
        type: Sequelize.ENUM('service_item', 'package_item'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      special_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('booking_items', ['booking_id']);
    await queryInterface.addIndex('booking_items', ['item_id', 'item_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('booking_items');
  }
};