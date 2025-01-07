const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProviderServiceCity extends Model {
    static associate(models) {
      this.belongsTo(models.ServiceProvider, { foreignKey: 'provider_id' });
      this.belongsTo(models.City, { foreignKey: 'city_id' });
    }
  }

  ProviderServiceCity.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_providers',
        key: 'provider_id'
      }
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'city_id'
      }
    },
    service_radius: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Service radius for this specific city in kilometers'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this is the provider\'s primary service city'
    }
  }, {
    sequelize,
    modelName: 'ProviderServiceCity',
    tableName: 'provider_service_cities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['provider_id', 'city_id']
      }
    ]
  });

  return ProviderServiceCity;
};