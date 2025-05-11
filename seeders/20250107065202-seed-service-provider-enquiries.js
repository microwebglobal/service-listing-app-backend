"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if users exist
    const users = await queryInterface.sequelize.query(
      'SELECT u_id FROM "users" WHERE role IN (\'business_service_provider\', \'business_employee\', \'service_provider\') LIMIT 5',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length === 0) {
      console.log("No service provider users found, skipping enquiries");
      return Promise.resolve();
    }
    
    // Check existing enquiries
    const existingEnquiries = await queryInterface.sequelize.query(
      'SELECT user_id FROM "service_provider_enquiries"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingUserIds = new Set(existingEnquiries.map(e => e.user_id));
    
    // Initialize available users that don't have enquiries yet
    const availableUsers = users.filter(user => !existingUserIds.has(user.u_id));
    
    if (availableUsers.length === 0) {
      console.log("All users already have enquiries, skipping insertion");
      return Promise.resolve();
    }
    
    // Current date for registration link expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Create enquiries for available users
    const enquiriesToInsert = [];
    
    if (availableUsers.length > 0) {
      enquiriesToInsert.push({
        user_id: availableUsers[0].u_id,
        business_type: "business",
        business_name: "Sharma Home Solutions",
        business_website: "https://sharmasolutions.in",
        number_of_employees: 12,
        authorized_person_name: "Rakesh Sharma",
        authorized_person_contact: "+916512345678",
        years_experience: 7,
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(72.8777 19.0760)"
        ),
        skills: "Wall Painting, Wall Cleaning, Interior Design",
        status: "pending",
        registration_link: "https://example.com/register/1",
        registration_link_expires: expiryDate,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    
    if (availableUsers.length > 1) {
      enquiriesToInsert.push({
        user_id: availableUsers[1].u_id,
        business_type: "individual",
        business_name: "Kumar Tech Services",
        business_website: null,
        number_of_employees: null,
        authorized_person_name: null,
        authorized_person_contact: null,
        years_experience: 5,
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(77.1025 28.7041)"
        ),
        skills: "Laptop Repair, Mobile Phone Fixing, Circuit Board Troubleshooting",
        status: "pending",
        registration_link: "https://example.com/register/2",
        registration_link_expires: expiryDate,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    
    if (availableUsers.length > 2) {
      enquiriesToInsert.push({
        user_id: availableUsers[2].u_id,
        business_type: "business",
        business_name: "Gupta Salon Services",
        business_website: "https://guptasalon.in",
        number_of_employees: 8,
        authorized_person_name: "Neha Gupta",
        authorized_person_contact: "+917812345678",
        years_experience: 10,
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(77.5946 12.9716)"
        ),
        skills: "Hair Styling, Facial, Manicure, Pedicure, Makeup",
        status: "approved",
        registration_link: "https://example.com/register/3",
        registration_link_expires: expiryDate,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }
    
    if (enquiriesToInsert.length > 0) {
      return queryInterface.bulkInsert("service_provider_enquiries", enquiriesToInsert);
    } else {
      console.log("No enquiries to insert, skipping");
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_enquiries", null, {});
  },
};