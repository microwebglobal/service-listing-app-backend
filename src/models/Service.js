const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsTo(models.ServiceType, {
        foreignKey: "type_id",
      });
      Service.hasMany(models.ServiceItem, {
        foreignKey: "service_id",
      });
    }
  }

  Service.init(
    {
      service_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      type_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "service_types",
          key: "type_id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      icon_url: DataTypes.STRING(255),
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "services",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return Service;
};
