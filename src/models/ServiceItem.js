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
      ServiceItem.hasMany(models.CitySpecificBuffertime, {
        foreignKey: "item_id",
        constraints: false,
        scope: {
          item_type: "service_item",
        },
      });
      ServiceItem.hasMany(models.ServiceCommission, {
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
      duration_hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      overview: DataTypes.TEXT,
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      grace_period: {
        type: DataTypes.DECIMAL(5, 2),
      },
      penalty_percentage: {
        type: DataTypes.DECIMAL(5, 2),
      },
      advance_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      is_home_visit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      icon_url: DataTypes.STRING(255),
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
