"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
  },
};
