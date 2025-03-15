const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProviderServiceCategory extends Model {
    static associate(models) {
      this.belongsTo(models.ServiceProvider, { 
        foreignKey: 'provider_id' 
      });
      
      this.belongsTo(models.ServiceCategory, { 
        foreignKey: 'category_id' 
      });

   
      this.belongsTo(models.Service, {
        foreignKey: 'service_id',
        allowNull: true
      });

      this.belongsTo(models.ServiceItem, {
        foreignKey: 'item_id',
        allowNull: true 
      });
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
    service_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'services',
        key: 'service_id'
      },
      comment: 'If set, provider is only approved for this specific service in the category'
    },
    item_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'service_items',
        key: 'item_id'
      },
      comment: 'If set, provider is only approved for this specific service item'
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Years of experience in this category/service'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if this is the provider\'s primary service category'
    },
    price_adjustment: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Optional price adjustments {type: "multiplier|fixed", value: number}',
      validate: {
        validPriceAdjustment(value) {
          if (value) {
            if (!['multiplier', 'fixed'].includes(value.type)) {
              throw new Error('Invalid price adjustment type');
            }
            if (typeof value.value !== 'number') {
              throw new Error('Price adjustment value must be a number');
            }
            if (value.type === 'multiplier' && value.value <= 0) {
              throw new Error('Price multiplier must be positive');
            }
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending_approval'),
      defaultValue: 'active',
      allowNull: false
    },
    approval_notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
        fields: ['provider_id', 'category_id', 'service_id', 'item_id'],
        name: 'unique_provider_service_mapping'
      },
      {
        fields: ['provider_id', 'status']
      }
    ]
  });

  ProviderServiceCategory.prototype.canProvideService = function(serviceId, itemId) {
    if (!this.service_id && !this.item_id) {
      return true;
    }
    if (this.service_id && !this.item_id) {
      return this.service_id === serviceId;
    }
    return this.service_id === serviceId && this.item_id === itemId;
  };

  return ProviderServiceCategory;
};