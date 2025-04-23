const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DailyPayoutLogs extends Model {
    static associate(models) {
      DailyPayoutLogs.belongsTo(models.ServiceProvider, {
        foreignKey: "provider_id",
        as: "provider",
        onDelete: 'CASCADE',
      });
    }
  }

  DailyPayoutLogs.init(
    {
      log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null initially during booking process
        references: {
          model: "service_providers",
          key: "provider_id",
        },
      },
      payout_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.ENUM("pending", "card", "upi", "net_banking", "cash"),
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      compleated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payout_status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
      transaction_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "DailyPayoutLogs",
      tableName: "daily_payout_logs",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return DailyPayoutLogs;
};
