"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM types if they don't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_bookings_status') THEN
          CREATE TYPE "enum_bookings_status" AS ENUM(
            'cart', 'payment_pending', 'confirmed', 'assigned', 'accepted', 
            'in_progress', 'completed', 'cancelled', 'refunded'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_bookings_cancelled_by') THEN
          CREATE TYPE "enum_bookings_cancelled_by" AS ENUM(
            'customer', 'provider', 'admin'
          );
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_bookings_penalty_status') THEN
          CREATE TYPE "enum_bookings_penalty_status" AS ENUM(
            'no_penalty', 'pending', 'fully_settled_advance', 
            'partially_settled_advance', 'apply_next_booking', 'completed'
          );
        END IF;
      END
      $$;
    `);

    // Then create the table
    await queryInterface.createTable("bookings", {
      booking_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "service_provider_employees",
          key: "employee_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      booking_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "cart",
          "payment_pending",
          "confirmed",
          "assigned",
          "accepted",
          "in_progress",
          "completed",
          "cancelled",
          "refunded"
        ),
        defaultValue: "cart",
      },
      service_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      service_location: {
        type: Sequelize.GEOMETRY("POINT"),
        allowNull: false,
      },
      customer_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: true,
      },
      otp_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelled_by: {
        type: Sequelize.ENUM("customer", "provider", "admin"),
        allowNull: true,
      },
      cancellation_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      penalty_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      penalty_status: {
        type: Sequelize.ENUM(
          "no_penalty",
          "pending",
          "fully_settled_advance",
          "partially_settled_advance",
          "apply_next_booking",
          "completed"
        ),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    
    // Add indexes
    await queryInterface.addIndex("bookings", ["user_id"]);
    await queryInterface.addIndex("bookings", ["provider_id"]);
    await queryInterface.addIndex("bookings", ["city_id"]);
    await queryInterface.addIndex("bookings", ["status"]);
    await queryInterface.addIndex("bookings", ["booking_date"]);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("bookings");
    
    // Drop the ENUM types
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_bookings_status";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_bookings_cancelled_by";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_bookings_penalty_status";`);
  },
};
