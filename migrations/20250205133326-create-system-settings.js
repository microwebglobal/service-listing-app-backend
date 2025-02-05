'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create system_settings table
    await queryInterface.createTable('system_settings', {
      setting_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category: {
        type: Sequelize.ENUM(
          'general',
          'booking',
          'payment',
          'notification',
          'provider_assignment'
        ),
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      data_type: {
        type: Sequelize.ENUM(
          'string',
          'number',
          'boolean',
          'json',
          'array'
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_encrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'u_id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Create booking_assignment_settings table
    await queryInterface.createTable('booking_assignment_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      city_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'city_id',
        },
      },
      category_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'service_categories',
          key: 'category_id',
        },
      },
      is_auto_assignment_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      assignment_weights: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          distance_weight: 40,
          rating_weight: 40,
          workload_weight: 20
        },
      },
      max_distance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
      },
      min_provider_rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.0,
      },
      max_daily_bookings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 8,
      },
      auto_reject_timeout: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 300,
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
      },
      cooldown_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1800,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Create unique index for city_id and category_id combination
    await queryInterface.addIndex(
      'booking_assignment_settings',
      ['city_id', 'category_id'],
      {
        unique: true,
        name: 'unique_city_category_settings'
      }
    );

    // Create assignment_history table
    await queryInterface.createTable('assignment_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'booking_id',
        },
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'service_providers',
          key: 'provider_id',
        },
      },
      attempt_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'accepted',
          'rejected',
          'timeout',
          'cancelled'
        ),
        defaultValue: 'pending',
      },
      provider_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      distance_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      rating_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      workload_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assignment_history');
    await queryInterface.dropTable('booking_assignment_settings');
    await queryInterface.dropTable('system_settings');
  }
};