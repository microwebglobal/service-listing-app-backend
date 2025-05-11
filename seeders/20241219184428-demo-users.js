"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const currentDate = new Date();

    
    const existingUsers = await queryInterface.sequelize.query(
      'SELECT email, mobile FROM "users" WHERE email = \'\' OR mobile = \'0766644532\' OR mobile = \'0776677854\' OR mobile = \'0776877854\' OR mobile = \'0779877854\' OR mobile = \'0749877854\' OR mobile = \'0739877854\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

   
    const existingEmails = new Set(existingUsers.map(user => user.email));
    const existingMobiles = new Set(existingUsers.map(user => user.mobile));

    
    const usersToInsert = [
      {
        name: "Test User",
        email: "",
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
        name: "Provider1",
        email: "provider@gmail.com",
        mobile: "0776677854",
        pw: hashedPassword,
        role: "business_service_provider",
        gender: "male",
        nic: "2002445556738",
        dob: "2002-04-25",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        name: "Provider2",
        email: "provider2@gmail.com",
        mobile: "0776877854",
        pw: hashedPassword,
        role: "business_employee",
        gender: "male",
        nic: "2004445556738",
        dob: "2002-04-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        name: "Provider3",
        email: "provider3@gmail.com",
        mobile: "0779877854",
        pw: hashedPassword,
        role: "business_employee",
        gender: "male",
        nic: "2034445556738",
        dob: "2002-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        name: "Provider4",
        email: "provider4@gmail.com",
        mobile: "0749877854",
        pw: hashedPassword,
        role: "service_provider",
        gender: "male",
        nic: "2034445556738",
        dob: "2002-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        name: "Admin",
        email: "admin@gmail.com",
        mobile: "0739877854",
        pw: hashedPassword,
        role: "admin",
        gender: "male",
        nic: "2034445556738",
        dob: "2002-05-27",
        account_status: "active",
        email_verified: true,
        mobile_verified: true,
        last_updated: currentDate,
        created_at: currentDate,
      },
    ].filter(user => {
   
      return !(existingEmails.has(user.email) || existingMobiles.has(user.mobile));
    });

    if (usersToInsert.length > 0) {
      return queryInterface.bulkInsert("users", usersToInsert);
    } else {
      console.log('No new users to insert - all users already exist');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};