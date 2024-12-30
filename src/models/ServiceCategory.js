const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceCategory extends Model {
    static associate(models) {
      // Direct relationship to CategoryCities
      ServiceCategory.hasMany(models.CategoryCities, {
        foreignKey: 'category_id',
        sourceKey: 'category_id',
        as: 'categoryMappings' // Added unique alias
      });
      
      // Many-to-many relationship with City
      ServiceCategory.belongsToMany(models.City, {
        through: models.CategoryCities,
        foreignKey: 'category_id',
        otherKey: 'city_id',
        as: 'cities' // Added unique alias
      });
      
      ServiceCategory.hasMany(models.SubCategory, {
        foreignKey: 'category_id'
      });
    }
  }

  ServiceCategory.init({
    category_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    icon_url: DataTypes.STRING(255),
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ServiceCategory',
    tableName: 'service_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return ServiceCategory;
};