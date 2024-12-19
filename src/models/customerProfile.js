'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerProfile extends Model {
    static associate(models) {
      CustomerProfile.belongsTo(models.User, {
        foreignKey: 'u_id',
        as: 'user'
      });
    }
  }

  CustomerProfile.init({
    cp_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    u_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'u_id'
      }
    },
    tier_status: {
      type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
      defaultValue: 'Bronze',
      allowNull: false,
      validate: {
        isIn: [['Bronze', 'Silver', 'Gold', 'Platinum']]
      }
    },
    loyalty_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    default_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'system'
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'system'
    }
  }, {
    sequelize,
    modelName: 'CustomerProfile',
    tableName: 'customer_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return CustomerProfile;
};