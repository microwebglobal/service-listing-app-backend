const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Package extends Model {
    static associate(models) {
      Package.belongsTo(models.ServiceType, {
        foreignKey: 'type_id'
      });
      Package.hasMany(models.PackageSection, {
        foreignKey: 'package_id'
      });
      Package.hasMany(models.CitySpecificPricing, {
        foreignKey: 'item_id',
        constraints: false,
        scope: {
          item_type: 'package'
        }
      });
    }
  }

  Package.init({
    package_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    type_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'service_types',
        key: 'type_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: DataTypes.TEXT,
    duration_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Package;
};
