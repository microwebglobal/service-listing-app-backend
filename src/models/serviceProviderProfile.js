// models/ServiceProviderProfile.js
"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProviderProfile extends Model {
    static associate(models) {
      ServiceProviderProfile.belongsTo(models.User, {
        foreignKey: "u_id", 
        as: "user",        
      });
    }

  }

  ServiceProviderProfile.init(
    {
      sp_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      u_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      business_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      business_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      reg_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      gst_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      verification_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      max_bookings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ServiceProviderProfile",
      tableName: "service_provider_profile",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ServiceProviderProfile;
};
