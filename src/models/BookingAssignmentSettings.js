const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class BookingAssignmentSettings extends Model {
      static associate(models) {
        BookingAssignmentSettings.belongsTo(models.City, {
          foreignKey: 'city_id',
          allowNull: true, // Allows for global settings
        });
        BookingAssignmentSettings.belongsTo(models.ServiceCategory, {
          foreignKey: 'category_id',
          allowNull: true, // Allows for global settings
        });
      }
    }
  
    BookingAssignmentSettings.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        city_id: {
          type: DataTypes.STRING,
          allowNull: true, // null means global setting
          references: {
            model: 'cities',
            key: 'city_id',
          },
        },
        category_id: {
          type: DataTypes.STRING,
          allowNull: true, // null means applies to all categories
          references: {
            model: 'service_categories',
            key: 'category_id',
          },
        },
        is_auto_assignment_enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        assignment_weights: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: {
            distance_weight: 40,
            rating_weight: 40,
            workload_weight: 20
          },
          validate: {
            validWeights(value) {
              const weights = Object.values(value);
              const sum = weights.reduce((a, b) => a + b, 0);
              if (sum !== 100) {
                throw new Error('Weights must sum to 100');
              }
            }
          }
        },
        max_distance: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 10.0, // in kilometers
        },
        min_provider_rating: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 4.0,
        },
        max_daily_bookings: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 8,
        },
        auto_reject_timeout: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 300, // in seconds
        },
        retry_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },
        cooldown_period: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1800, // in seconds (30 minutes)
        }
      },
      {
        sequelize,
        modelName: "BookingAssignmentSettings",
        tableName: "booking_assignment_settings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['city_id', 'category_id'],
            name: 'unique_city_category_settings'
          }
        ]
      }
    );
  
    return BookingAssignmentSettings;
  };