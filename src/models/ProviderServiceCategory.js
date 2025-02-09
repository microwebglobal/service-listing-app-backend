const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProviderServiceCategory extends Model {
    static associate(models) {
      this.belongsTo(models.ServiceProvider, { foreignKey: 'provider_id' });
      this.belongsTo(models.ServiceCategory, { foreignKey: 'category_id' });
    }
  }

  ProviderServiceCategory.init({
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
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'service_categories',
        key: 'category_id'
      }
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Years of experience in this specific category'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this is the provider\'s primary service category'
    }
  }, {
    sequelize,
    modelName: 'ProviderServiceCategory',
    tableName: 'provider_service_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['provider_id', 'category_id']
      }
    ]
  });

  return ProviderServiceCategory;
};