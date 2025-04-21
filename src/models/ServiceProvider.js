const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProvider extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.ServiceProviderEnquiry, {
        foreignKey: "enquiry_id",
        as: "enquiry",
      });
      this.hasMany(models.ServiceProviderDocument, {
        foreignKey: "provider_id",
      });
      this.hasMany(models.ServiceProviderEmployee, {
        foreignKey: "provider_id",
      });

      this.hasMany(models.ProviderServiceCity, {
        foreignKey: "provider_id",
        as: "providerCities",
      });

      this.hasMany(models.ProviderServiceCategory, {
        foreignKey: "provider_id",
        as: "providerCategories",
      });

      this.belongsToMany(models.ServiceCategory, {
        through: models.ProviderServiceCategory,
        foreignKey: "provider_id",
        otherKey: "category_id",
        as: "serviceCategories",
      });

      this.belongsToMany(models.City, {
        through: models.ProviderServiceCity,
        foreignKey: "provider_id",
        otherKey: "city_id",
        as: "serviceCities",
      });
    }
  }

  ServiceProvider.init(
    {
      provider_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
      },
      enquiry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "service_provider_enquiries",
          key: "enquiry_id",
        },
      },
      business_type: {
        type: DataTypes.ENUM("individual", "business"),
        allowNull: false,
      },
      business_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      business_registration_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      aadhar_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pan_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      tax_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      business_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      whatsapp_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true,
      },
      alternate_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true,
      },
      emergency_contact_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      reference_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      primary_location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
        comment: "Main operating location",
      },
      exact_address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      service_radius: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Service radius in kilometers",
      },
      availability_type: {
        type: DataTypes.ENUM("full_time", "part_time"),
        allowNull: false,
      },
      availability_hours: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      years_experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specializations: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      qualification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      profile_bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      languages_spoken: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      social_media_links: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejection_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.ENUM("upi", "bank"),
        allowNull: false,
      },
      payment_details: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending_approval",
          "active",
          "suspended",
          "inactive",
          "rejected"
        ),
        defaultValue: "pending_approval",
      },
    },
    {
      sequelize,
      modelName: "ServiceProvider",
      tableName: "service_providers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return ServiceProvider;
};
