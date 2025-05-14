'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('addresses');
    if (!tableInfo.location) {
      await queryInterface.addColumn('addresses', 'location', {
        type: Sequelize.GEOGRAPHY('POINT', 4326),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('addresses');
      if (tableInfo.location) {
        await queryInterface.removeColumn('addresses', 'location');
      }
    } catch (error) {
      console.log('Column might not exist, continuing...');
    }
  }
};