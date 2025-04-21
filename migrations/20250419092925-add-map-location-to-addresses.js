"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("addresses", "map_location", {
      type: Sequelize.GEOMETRY("POINT"),
      allowNull: false,
      defaultValue: {
        type: "Point",
        coordinates: [72.8777, 19.076],
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("addresses", "map_location");
  },
};
