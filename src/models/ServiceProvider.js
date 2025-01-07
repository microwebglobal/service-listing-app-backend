const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProvider extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.hasMany(models.ProviderDocument, { foreignKey: 'provider_id' });
      this.hasMany(models.ServiceProviderEmployee, { foreignKey: 'provider_id' });
      
      // Many-to-many relationships
      this.belongsToMany(models.ServiceCategory, {
        through: 'provider_service_categories',
        foreignKey: 'provider_id',
        otherKey: 'category_id'
      });
      this.belongsToMany(models.City, {
        through: 'provider_service_cities',
        foreignKey: 'provider_id',
        otherKey: 'city_id'
      });
    }
  }

  ServiceProvider.init({
    provider_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'u_id'
      }
    },
    business_type: {
      type: DataTypes.ENUM('individual', 'business'),
      allowNull: false
    },
    business_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    business_registration_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    primary_location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
      comment: 'Main operating location'
    },
    service_radius: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Service radius in kilometers'
    },
    availability_type: {
      type: DataTypes.ENUM('full_time', 'part_time'),
      allowNull: false
    },
    availability_hours: {
      type: DataTypes.JSON,
      allowNull: true
    },
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    specializations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    profile_bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    languages_spoken: {
      type: DataTypes.JSON,
      allowNull: false
    },
    social_media_links: {
      type: DataTypes.JSON,
      allowNull: true
    },
    payment_method: {
      type: DataTypes.ENUM('upi', 'bank'),
      allowNull: false
    },
    payment_details: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending_approval', 'active', 'suspended', 'inactive'),
      defaultValue: 'pending_approval'
    }
  }, {
    sequelize,
    modelName: 'ServiceProvider',
    tableName: 'service_providers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return ServiceProvider;
};