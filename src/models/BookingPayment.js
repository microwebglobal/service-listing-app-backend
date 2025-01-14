const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class BookingPayment extends Model {
      static associate(models) {
        BookingPayment.belongsTo(models.Booking, {
          foreignKey: 'booking_id'
        });
      }
    }
  
    BookingPayment.init({
      payment_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      booking_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'booking_id'
        }
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      tip_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: DataTypes.ENUM('card', 'upi', 'net_banking'),
        allowNull: false
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refund_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refund_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      refund_status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'BookingPayment',
      tableName: 'booking_payments',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true
    });
  
    return BookingPayment;
  };