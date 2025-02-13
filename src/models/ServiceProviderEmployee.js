const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProviderEmployee extends Model {
    static associate(models) {
      this.belongsTo(models.ServiceProvider, { foreignKey: "provider_id" });
      this.belongsTo(models.User, { foreignKey: "user_id" });
      this.belongsToMany(models.ServiceCategory, {
        through: "employee_service_categories",
        foreignKey: "employee_id",
        otherKey: "category_id",
      });
    }
  }

  ServiceProviderEmployee.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
      },
      role: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      qualification: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      years_experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "on_work"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "ServiceProviderEmployee",
      tableName: "service_provider_employees",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return ServiceProviderEmployee;
};
