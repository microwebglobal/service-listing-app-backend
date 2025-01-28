const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceItem extends Model {
    static associate(models) {
      ServiceItem.belongsTo(models.Service, {
        foreignKey: "service_id",
      });
      ServiceItem.hasMany(models.CitySpecificPricing, {
        foreignKey: "item_id",
        constraints: false,
        scope: {
          item_type: "service_item",
        },
      });
      ServiceItem.hasMany(models.SpecialPricing, {
        foreignKey: "item_id",
        constraints: false,
        scope: {
          item_type: "service_item",
        },
      });
    }
  }

  ServiceItem.init(
    {
      item_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      service_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "services",
          key: "service_id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      overview: DataTypes.TEXT,
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ServiceItem",
      tableName: "service_items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return ServiceItem;
};
