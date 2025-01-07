const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProviderEnquiry extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      // Many-to-many relationships for categories and cities
      this.belongsToMany(models.ServiceCategory, {
        through: 'enquiry_service_categories',
        foreignKey: 'enquiry_id',
        otherKey: 'category_id'
      });
      this.belongsToMany(models.City, {
        through: 'enquiry_service_cities',
        foreignKey: 'enquiry_id',
        otherKey: 'city_id'
      });
    }
  }

  ServiceProviderEnquiry.init({
    enquiry_id: {
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
    years_experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    primary_location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
      comment: 'Main operating location'
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    registration_link: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    registration_link_expires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ServiceProviderEnquiry',
    tableName: 'service_provider_enquiries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return ServiceProviderEnquiry;
};