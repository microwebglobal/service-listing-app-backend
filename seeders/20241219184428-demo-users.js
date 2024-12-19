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
        email: 'admin@example.com',
        mobile: '1234567890',
        pw: hashedPassword,
        role: 'admin',
        is_active: true,
        created_by: 'system',
        updated_by: 'system',
        created_at: currentDate,
        updated_at: currentDate
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};