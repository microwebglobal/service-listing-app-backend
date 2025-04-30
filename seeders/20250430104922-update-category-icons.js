"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "service_categories",
      { icon_url: "/uploads/images/salon_women_updated.jpg" },
      { category_id: "CAT001" }
    );

    await queryInterface.bulkUpdate(
      "service_categories",
      { icon_url: "/uploads/images/ac_repair_updated.webp" },
      { category_id: "CAT002" }
    );

    await queryInterface.bulkUpdate(
      "service_categories",
      { icon_url: "/uploads/images/wall_painting_updated.webp" },
      { category_id: "CAT003" }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      "service_categories",
      { icon_url: "/uploads/images/1735813069408.jpg" },
      { category_id: "CAT001" }
    );

    await queryInterface.bulkUpdate(
      "service_categories",
      { icon_url: "/uploads/images/1735813165476.webp" },
      { category_id: { [Sequelize.Op.in]: ["CAT002", "CAT003"] } }
    );
  },
};
