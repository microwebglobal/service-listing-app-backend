"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("service_providers", [
      {
        user_id: 2,
        business_type: "business",
        business_name: "Home Solutions Ltd.",
        business_registration_number: "123456789",
        aadhar_number: "1234567",
        pan_number: "234567",
        whatsapp_number: "0786677893",
        emergency_contact_name: "em contact",
        reference_name: "ref name",
        reference_number: "08967567",
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(103.8198 1.3521)"
        ),
        service_radius: 50,
        availability_type: "full_time",
        availability_hours: JSON.stringify({
          Monday: "9am-6pm",
          Tuesday: "9am-6pm",
        }),
        years_experience: 10,
        specializations: ["Wall Painting", "Wall Cleaning"],
        qualification: "Certificate in interior designing",
        profile_bio:
          "Experienced Home service provider specializing in custom solutions.",
        languages_spoken: ["English", "Hindi"],
        social_media_links: JSON.stringify({
          facebook: "https://facebook.com/homesolutions",
          linkedin: "https://linkedin.com/homesolutions",
        }),
        payment_method: "bank",
        payment_details: JSON.stringify({
          account_number: "123456789",
          bank_name: "Test Bank",
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_providers", null, {});
  },
};
