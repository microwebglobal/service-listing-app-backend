"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("service_provider_enquiries", [
      {
        enquiry_id: 1,
        user_id: 2,
        business_type: "business",
        business_name: "Home Solutions Ltd.",
        years_experience: 5,
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(103.8198 1.3521)"
        ),
        skills: "Wall Painting, Wall Cleaning",
        status: "pending",
        registration_link: "https://example.com/register/1",
        registration_link_expires: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        enquiry_id: 2,
        user_id: 3,
        business_type: "individual",
        business_name: "Tech Repairs Ltd.",
        years_experience: 10,
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(80.8198 1.3521)"
        ),
        skills:
          "Laptop Repair, Mobile Phone Fixing, Circuit Board Troubleshooting",
        status: "pending",
        registration_link: "https://example.com/register/2",
        registration_link_expires: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_enquiries", null, {});
  },
};
