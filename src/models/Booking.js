const { Model } = require("sequelize");

// Booking Model
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "customer",
      });
      Booking.belongsTo(models.ServiceProvider, {
        foreignKey: "provider_id",
        as: "provider",
      });
      Booking.belongsTo(models.ServiceProviderEmployee, {
        foreignKey: "employee_id",
        as: "employee",
      });
      Booking.belongsTo(models.City, {
        foreignKey: "city_id",
      });
      Booking.hasMany(models.BookingItem, {
        foreignKey: "booking_id",
      });
      Booking.hasOne(models.BookingPayment, {
        foreignKey: "booking_id",
      });
    }
  }

  Booking.init(
    {
      booking_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null initially during booking process
        references: {
          model: "service_providers",
          key: "provider_id",
        },
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null initially during booking process
        references: {
          model: "service_provider_employees",
          key: "employee_id",
        },
      },
      city_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
      },
      booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "cart", // Initial state when items are added
          "payment_pending",
          "confirmed",
          "assigned", // When provider is assigned
          "in_progress",
          "completed",
          "cancelled",
          "refunded"
        ),
        defaultValue: "cart",
      },
      service_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      service_location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      customer_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancelled_by: {
        type: DataTypes.ENUM("customer", "provider", "admin"),
        allowNull: true,
      },
      cancellation_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      penalty_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      penalty_status: {
        type: DataTypes.ENUM(
          "no_penalty",
          "pending",
          "fully_settled_advance",
          "partially_settled_advance",
          "apply_next_booking",
          "completed"
        ),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return Booking;
};
