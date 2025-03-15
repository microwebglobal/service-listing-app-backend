const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ServiceCommission extends Model {
    static associate(models) {
      // define association here
      ServiceCommission.belongsTo(models.City, {
        foreignKey: "city_id",
      });
    }
  }
  ServiceCommission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      city_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "cities",
          key: "city_id",
        },
      },
      item_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_type: {
        type: DataTypes.ENUM("service_item", "package", "package_item"),
        allowNull: false,
      },
      commission_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ServiceCommission",
      tableName: "service_commissions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["city_id", "item_id", "item_type"],
        },
      ],
    }
  );
  return ServiceCommission;
};
