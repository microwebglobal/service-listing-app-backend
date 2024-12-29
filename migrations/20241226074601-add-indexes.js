'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Helper function to safely add index
    const safeAddIndex = async (tableName, attributes, options = {}) => {
      try {
        await queryInterface.addIndex(tableName, attributes, options);
      } catch (error) {
        // If error is about index already existing, ignore it
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    };

    // Add indexes for better query performance
    await safeAddIndex('service_categories', ['slug']);
    await safeAddIndex('sub_categories', ['slug']);
    await safeAddIndex('service_types', ['sub_category_id']);
    await safeAddIndex('services', ['type_id']);
    await safeAddIndex('service_items', ['service_id']);
    await safeAddIndex('packages', ['type_id']);
    await safeAddIndex('package_items', ['package_id']);
    await safeAddIndex('city_specific_pricing', ['item_id']);
  },

  down: async (queryInterface) => {
    // Helper function to safely remove index
    const safeRemoveIndex = async (tableName, attributes) => {
      try {
        await queryInterface.removeIndex(tableName, attributes);
      } catch (error) {
        // If error is about index not existing, ignore it
        if (!error.message.includes('does not exist')) {
          throw error;
        }
      }
    };

    await safeRemoveIndex('service_categories', ['slug']);
    await safeRemoveIndex('sub_categories', ['slug']);
    await safeRemoveIndex('service_types', ['sub_category_id']);
    await safeRemoveIndex('services', ['type_id']);
    await safeRemoveIndex('service_items', ['service_id']);
    await safeRemoveIndex('packages', ['type_id']);
    await safeRemoveIndex('package_items', ['package_id']);
    await safeRemoveIndex('city_specific_pricing', ['item_id']);
  }
};