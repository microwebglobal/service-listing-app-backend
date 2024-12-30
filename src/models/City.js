const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      // Direct relationship to CategoryCities
      City.hasMany(models.CategoryCities, {
        foreignKey: 'city_id',
        sourceKey: 'city_id',
        as: 'cityCategories' // Added unique alias
      });
      
      // Many-to-many relationship with ServiceCategory
      City.belongsToMany(models.ServiceCategory, {
        through: models.CategoryCities,
        foreignKey: 'city_id',
        otherKey: 'category_id',
        as: 'serviceCategories' // Added unique alias
      });
      
      City.hasMany(models.CitySpecificPricing, {
        foreignKey: 'city_id'
      });
    }
  }

  City.init({
    city_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  return City;
};