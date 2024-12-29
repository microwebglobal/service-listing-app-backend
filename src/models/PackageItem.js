const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PackageItem extends Model {
    static associate(models) {
      PackageItem.belongsTo(models.PackageSection, {
        foreignKey: 'section_id'
      });
      PackageItem.hasMany(models.CitySpecificPricing, {
        foreignKey: 'item_id',
        constraints: false,
        scope: {
          item_type: 'package_item'
        }
      });
    }
  }

  PackageItem.init({
    item_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    section_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'package_sections',
        key: 'section_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_none_option: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'PackageItem',
    tableName: 'package_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PackageItem;
};