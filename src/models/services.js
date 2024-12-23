//models/services/Services.js
"use strict"

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
      // Define any class methods here
      static associate(models) {
        // Define associations here if needed
      }
    }
  
    Service.init(
      {
        service_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "Service name cannot be empty",
            },
            len: {
              args: [2, 100],
              msg: "Service name must be between 2 and 100 characters",
            },
          },
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        base_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        advance_percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
        },
        max_booking_days: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("active", "inactive"),
          defaultValue: "active",
          allowNull: false,
        },
        last_updated: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: "Service",
        tableName: "services",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "last_updated",
      }
    );
  
    return Service;
  };