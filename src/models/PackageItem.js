const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class PackageItem extends Model {
      static associate(models) {
        PackageItem.belongsTo(models.Package, {
          foreignKey: 'package_id'
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
      package_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'packages',
          key: 'package_id'
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
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
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
  