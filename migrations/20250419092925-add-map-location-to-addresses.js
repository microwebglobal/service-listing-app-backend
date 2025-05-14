"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('addresses')) {
        console.log('Table "addresses" does not exist, skipping migration');
        return;
      }

      const tableDefinition = await queryInterface.describeTable('addresses');
      if (tableDefinition.location) {
        console.log('Column "location" already exists in "addresses" table, skipping addition');
      } else {
        await queryInterface.addColumn("addresses", "location", {
          type: Sequelize.GEOGRAPHY("POINT", 4326),
          allowNull: true,
        });
        console.log('Column "location" added to "addresses" table');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('addresses')) {
        console.log('Table "addresses" does not exist, skipping rollback');
        return;
      }

      const tableDefinition = await queryInterface.describeTable('addresses');
      if (tableDefinition.location) {
        await queryInterface.removeColumn("addresses", "location");
        console.log('Column "location" removed from "addresses" table');
      } else {
        console.log('Column "location" does not exist in "addresses" table, skipping removal');
      }
    } catch (error) {
      console.error('Error in migration rollback:', error);
      throw error;
    }
  },
};