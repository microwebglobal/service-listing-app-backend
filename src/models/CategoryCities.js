const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoryCities extends Model {
    static associate(models) {
      CategoryCities.belongsTo(models.ServiceCategory, {
        foreignKey: 'category_id',
        targetKey: 'category_id',
        as: 'serviceCategory' // Added unique alias
      });
      
      CategoryCities.belongsTo(models.City, {
        foreignKey: 'city_id',
        targetKey: 'city_id',
        as: 'city' // Added unique alias
      });
    }
  }

  CategoryCities.init({
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
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'service_categories',
        key: 'category_id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'CategoryCities',
    tableName: 'category_cities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['city_id', 'category_id']
      }
    ]
  });

  return CategoryCities;
};
