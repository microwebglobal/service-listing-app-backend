'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('booking_payments', {
      payment_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'booking_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tip_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('pending','card', 'upi', 'net_banking','cash'),
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refund_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      refund_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: true
      },
      cash_collected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cash_collected_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'service_providers',
          key: 'provider_id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('booking_payments', ['booking_id']);
    await queryInterface.addIndex('booking_payments', ['payment_status']);
    await queryInterface.addIndex('booking_payments', ['transaction_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('booking_payments');
  }
};