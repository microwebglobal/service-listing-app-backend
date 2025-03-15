"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CitySpecificBuffertime extends Model {
    static associate(models) {
      // Define associations
      CitySpecificBuffertime.belongsTo(models.City, {
        foreignKey: "city_id",
        as: "city",
      });
    }
  }

  CitySpecificBuffertime.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      city_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
      },
      item_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_type: {
        type: DataTypes.ENUM("service_item", "package", "package_item"),
        allowNull: false,
      },
      buffer_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      buffer_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CitySpecificBuffertime",
      tableName: "city_specific_buffertime",
      timestamps: true,
      underscored: true,
    }
  );

  return CitySpecificBuffertime;
};
