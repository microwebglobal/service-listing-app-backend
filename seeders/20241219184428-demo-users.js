"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const currentDate = new Date();

    const existingUsers = await queryInterface.sequelize.query(
      'SELECT email, mobile FROM "users"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingEmails = new Set(existingUsers.map(user => user.email));
    const existingMobiles = new Set(existingUsers.map(user => user.mobile));

    const usersToInsert = [
      {
        u_id: 1,
        name: "Test Customer",
        email: "customer@example.com",
        mobile: "0766644532",
        pw: hashedPassword,
        role: "customer",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 2,
        name: "Raj Service Provider",
        email: "provider@gmail.com",
        mobile: "0776677854",
        pw: hashedPassword,
        role: "business_service_provider",
        gender: "male",
        nic: "2002445556738",
        dob: "1988-04-25",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 3,
        name: "Anand Employee",
        email: "provider2@gmail.com",
        mobile: "0776877854",
        pw: hashedPassword,
        role: "business_employee",
        gender: "male",
        nic: "2004445556738",
        dob: "1992-04-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 4,
        name: "Priya Employee",
        email: "provider3@gmail.com",
        mobile: "0779877854",
        pw: hashedPassword,
        role: "business_employee",
        gender: "female",
        nic: "2034445556738",
        dob: "1995-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 5,
        name: "Deepak Provider",
        email: "provider4@gmail.com",
        mobile: "0749877854",
        pw: hashedPassword,
        role: "service_provider",
        gender: "male",
        nic: "2034445556738",
        dob: "1990-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 6,
        name: "Admin User",
        email: "admin@gmail.com",
        mobile: "0739877854",
        pw: hashedPassword,
        role: "admin",
        gender: "male",
        nic: "2034445556738",
        dob: "1985-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 7,
        name: "Neha Customer",
        email: "neha@example.com",
        mobile: "0766644533",
        pw: hashedPassword,
        role: "customer",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        u_id: 8,
        name: "Kavita Salon",
        email: "kavita@salon.com",
        mobile: "0776677855",
        pw: hashedPassword,
        role: "business_service_provider",
        gender: "female",
        nic: "2102445556738",
        dob: "1989-07-15",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      }
    ].filter(user => !existingEmails.has(user.email) && !existingMobiles.has(user.mobile));

    if (usersToInsert.length > 0) {
      return queryInterface.bulkInsert("users", usersToInsert);
    } else {
      console.log('All users already exist, skipping insertion');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};