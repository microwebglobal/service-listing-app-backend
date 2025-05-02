"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "service_items",
      { icon_url: "/uploads/images/arms_wax.jpg" },
      { item_id: "ITEM001" }
    );

    await queryInterface.bulkUpdate(
      "service_items",
      { icon_url: "/uploads/images/legs_wax.jpg" },
      { item_id: "ITEM002" }
    );

    await queryInterface.bulkUpdate(
      "service_items",
      { icon_url: "/uploads/images/rica_arms_wax.jpg" },
      { item_id: "ITEM003" }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "service_items",
      { icon_url: "/uploads/images/1735813069408.jpg" },
      { item_id: { [Sequelize.Op.in]: ["ITEM001", "ITEM002", "ITEM003"] } }
    );
  },
};
