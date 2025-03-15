const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookingItem extends Model {
    static associate(models) {
      BookingItem.belongsTo(models.Booking, {
        foreignKey: "booking_id",
      });
      BookingItem.belongsTo(models.ServiceItem, {
        foreignKey: "item_id",
        constraints: false,
        targetKey: "item_id",
        as: "serviceItem",
      });

      BookingItem.belongsTo(models.PackageItem, {
        as: "packageItem",
        foreignKey: "item_id",
        targetKey: "item_id",
        constraints: false,
      });
    }
  }

  BookingItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "bookings",
          key: "booking_id",
        },
      },
      item_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_type: {
        type: DataTypes.ENUM("service_item", "package_item"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      special_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      advance_payment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "BookingItem",
      tableName: "booking_items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return BookingItem;
};
