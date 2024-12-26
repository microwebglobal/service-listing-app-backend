// seeders/YYYYMMDDHHMMSS-demo-users.js
'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const currentDate = new Date();
    
    return queryInterface.bulkInsert('users', [
      {
        name: 'Test User',
        email: '',
        mobile: '112345678',
        mobile: '0766644532',
        pw: hashedPassword,
        role: 'customer',
        last_updated: currentDate,
        created_at: currentDate,
      },
      {
        name: 'Provider1',
        email: 'provider@gmail.com',
        mobile: '0776677854',
        pw: hashedPassword,
        role: 'service_provider',
        gender: 'male',
        nic: '2002445556738',
        dob: '2002-04-25',
        last_updated: currentDate,
        created_at: currentDate,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};