"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_service_categories", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      provider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "service_categories",
          key: "category_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      service_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "services",
          key: "service_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "If set, provider is only approved for this specific service in the category"
      },
      item_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "If set, provider is only approved for this specific service item"
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Years of experience in this category/service",
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if this is the provider's primary service category",
      },
      price_adjustment: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Optional price adjustments {type: 'multiplier|fixed', value: number}",
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending_approval'),
        defaultValue: 'active',
        allowNull: false,
      },
      approval_notes: {
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

    await queryInterface.addIndex(
      "provider_service_categories",
      ["provider_id", "category_id", "service_id", "item_id"],
      {
        unique: true,
        name: "unique_provider_service_mapping"
      }
    );

    await queryInterface.addIndex(
      "provider_service_categories",
      ["provider_id", "status"],
      {
        name: "idx_provider_status"
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("provider_service_categories");
  },
};