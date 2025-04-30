"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "sub_categories",
      { icon_url: "/uploads/images/waxing_updated.jpg" },
      { sub_category_id: "SCAT001" }
    );

    await queryInterface.bulkUpdate(
      "sub_categories",
      { icon_url: "/uploads/images/ac_services_updated.jpg" },
      { sub_category_id: "SCAT002" }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "sub_categories",
      { icon_url: "/uploads/images/1735813069408.jpg" },
      {
        sub_category_id: {
          [Sequelize.Op.in]: ["SCAT001", "SCAT002"],
        },
      }
    );
  },
};
