const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CitySpecificPricing extends Model {
    static associate(models) {
      CitySpecificPricing.belongsTo(models.City, {
        foreignKey: 'city_id'
      });
    }
  }

  CitySpecificPricing.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'city_id'
      }
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('service_item', 'package', 'package_item'),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CitySpecificPricing',
    tableName: 'city_specific_pricing',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
      indexes: [
      {
        unique: true,
        fields: ['city_id', 'item_id', 'item_type']
      }
    ]
  });

  return CitySpecificPricing;
};