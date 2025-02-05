const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AssignmentHistory extends Model {
      static associate(models) {
        AssignmentHistory.belongsTo(models.Booking, {
          foreignKey: 'booking_id'
        });
        AssignmentHistory.belongsTo(models.ServiceProvider, {
          foreignKey: 'provider_id'
        });
      }
    }
  
    AssignmentHistory.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      booking_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'booking_id'
        }
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'service_providers',
          key: 'provider_id'
        }
      },
      attempt_number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'accepted',
          'rejected',
          'timeout',
          'cancelled'
        ),
        defaultValue: 'pending'
      },
      provider_score: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      distance_score: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      rating_score: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      workload_score: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      response_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Response time in seconds'
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'AssignmentHistory',
      tableName: 'assignment_history',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true
    });
  
    return AssignmentHistory;
  };