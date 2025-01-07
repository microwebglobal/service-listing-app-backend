"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const currentDate = new Date();

    return queryInterface.bulkInsert("users", [
      {
        u_id: 1,
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
        u_id: 2,
        name: "Provider1",
        email: "provider@gmail.com",
        mobile: "0776677854",
        pw: hashedPassword,
        role: "service_provider",
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
        u_id: 3,
        name: "Provider2",
        email: "provider2@gmail.com",
        mobile: "0776877854",
        pw: hashedPassword,
        role: "service_provider",
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
        u_id: 4,
        name: "Provider3",
        email: "provider3@gmail.com",
        mobile: "0779877854",
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
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
