const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SpecialPricing extends Model {
    static associate(models) {
      SpecialPricing.belongsTo(models.City, {
        foreignKey: 'city_id',
        allowNull: true // Allows for global special pricing
      });
    }
  }

  SpecialPricing.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('service_item', 'package_item'),
      allowNull: false
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: true, // null means global special pricing
      references: {
        model: 'cities',
        key: 'city_id'
      }
    },
    special_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'SpecialPricing',
    tableName: 'special_pricing',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['item_id', 'item_type', 'city_id', 'status'],
        where: {
          status: 'active'
        }
      }
    ]
  });

  return SpecialPricing;
};
