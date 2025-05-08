"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn("addresses", "location", {
    //   type: Sequelize.GEOGRAPHY("POINT", 4326),
    //   allowNull: true,
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn("addresses", "map_location");
  },
};
