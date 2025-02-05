const { Model } = require("sequelize");

// SystemSettings Model for all configurable settings
module.exports = (sequelize, DataTypes) => {
  class SystemSettings extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  SystemSettings.init(
    {
      setting_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category: {
        type: DataTypes.ENUM(
          'general',
          'booking',
          'payment',
          'notification',
          'provider_assignment'
        ),
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      data_type: {
        type: DataTypes.ENUM(
          'string',
          'number',
          'boolean',
          'json',
          'array'
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_encrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'u_id',
        },
      },
    },
    {
      sequelize,
      modelName: "SystemSettings",
      tableName: "system_settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return SystemSettings;
};
