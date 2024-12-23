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
        name: 'Admin User',
        email: '',
        mobile: '1234567890',
        pw: hashedPassword,
        role: 'customer',
        last_updated: currentDate,
        created_at: currentDate,
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};