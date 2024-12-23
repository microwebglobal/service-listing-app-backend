// models/UserAddress.js
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    static associate(models) {
        UserAddress.belongsTo(models.User, {
            foreignKey: 'u_id', // foreign key in UserAddress model
            as: 'user',         // alias for the relationship
          });
    }
  }

  UserAddress.init(
    {
      addr_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      u_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      address_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'primary',
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      long: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'UserAddress',
      tableName: 'user_address',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return UserAddress;
};
