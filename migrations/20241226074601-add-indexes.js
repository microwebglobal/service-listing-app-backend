'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes for better query performance
    await queryInterface.addIndex('service_categories', ['slug']);
    await queryInterface.addIndex('sub_categories', ['slug']);
    await queryInterface.addIndex('service_types', ['sub_category_id']);
    await queryInterface.addIndex('services', ['type_id']);
    await queryInterface.addIndex('service_items', ['service_id']);
    await queryInterface.addIndex('packages', ['type_id']);
    await queryInterface.addIndex('package_items', ['package_id']);
    await queryInterface.addIndex('city_specific_pricing', ['item_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('service_categories', ['slug']);
    await queryInterface.removeIndex('sub_categories', ['slug']);
    await queryInterface.removeIndex('service_types', ['sub_category_id']);
    await queryInterface.removeIndex('services', ['type_id']);
    await queryInterface.removeIndex('service_items', ['service_id']);
    await queryInterface.removeIndex('packages', ['type_id']);
    await queryInterface.removeIndex('package_items', ['package_id']);
    await queryInterface.removeIndex('city_specific_pricing', ['item_id']);
  }
};