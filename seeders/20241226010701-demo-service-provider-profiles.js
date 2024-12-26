'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'service_provider_profiles',
      [
        {
          u_id: 1,
          business_type: 'individual',
          business_name: 'ABC Plumbing Services',
          verification_status: 'pending',
          rating: 4.5,
          max_bookings: 50,
          about: 'We provide top-notch plumbing services in the city.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          u_id: 2,
          business_type: 'business',
          business_name: 'Electric Experts',
          reg_number: 'REG654321',
          gst_number: 'GST0987654321',
          verification_status: 'verified',
          rating: 4.0,
          max_bookings: 30,
          about: 'Expert electricians for all your home and office needs.',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_provider_profiles', null, {});
  }
};
