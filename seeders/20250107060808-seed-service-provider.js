"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const existingProviders = await queryInterface.sequelize.query(
      'SELECT user_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingUserIds = new Set(existingProviders.map(provider => provider.user_id));
    
    const providersToInsert = [
      {
        user_id: 2,
        business_type: "business",
        business_name: "Raj Home Solutions",
        business_registration_number: "123456789",
        aadhar_number: "1234567890123",
        pan_number: "ABCDE1234F",
        whatsapp_number: "0786677893",
        emergency_contact_name: "Sunil Kumar",
        reference_name: "Vikram Sharma",
        reference_number: "08967567123",
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(72.8777 19.0760)"
        ),
        exact_address: "123 Andheri East, Mumbai, Maharashtra",
        service_radius: 15,
        availability_type: "full_time",
        availability_hours: JSON.stringify({
          monday: { start: "09:00", end: "18:00", isOpen: true },
          tuesday: { start: "09:00", end: "18:00", isOpen: true },
          wednesday: { start: "09:00", end: "18:00", isOpen: true },
          thursday: { start: "09:00", end: "18:00", isOpen: true },
          friday: { start: "09:00", end: "18:00", isOpen: true },
          saturday: { start: "09:00", end: "18:00", isOpen: true },
          sunday: { start: "09:00", end: "18:00", isOpen: false },
        }),
        years_experience: 8,
        specializations: ["Wall Painting", "Wall Cleaning"],
        qualification: "Certificate in interior designing",
        profile_bio:
          "Experienced Home service provider specializing in custom solutions.",
        languages_spoken: ["English", "Hindi", "Marathi"],
        social_media_links: JSON.stringify({
          facebook: "https://facebook.com/rajhomesolutions",
          instagram: "https://instagram.com/rajhomesolutions",
        }),
        payment_method: "bank",
        payment_details: JSON.stringify({
          account_number: "123456789012",
          bank_name: "HDFC Bank",
          ifsc_code: "HDFC0001234",
          account_holder: "Raj Kumar"
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 5,
        business_type: "individual",
        business_name: "Deepak AC Services",
        business_registration_number: null,
        aadhar_number: "9876543210123",
        pan_number: "FGHIJ5678K",
        whatsapp_number: "0749877854",
        emergency_contact_name: "Ravi Patel",
        reference_name: "Manoj Gupta",
        reference_number: "09876543210",
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(77.1025 28.7041)"
        ),
        exact_address: "45 Karol Bagh, Delhi",
        service_radius: 10,
        availability_type: "part_time",
        availability_hours: JSON.stringify({
          monday: { start: "10:00", end: "19:00", isOpen: true },
          tuesday: { start: "10:00", end: "19:00", isOpen: true },
          wednesday: { start: "10:00", end: "19:00", isOpen: true },
          thursday: { start: "10:00", end: "19:00", isOpen: true },
          friday: { start: "10:00", end: "19:00", isOpen: true },
          saturday: { start: "10:00", end: "17:00", isOpen: true },
          sunday: { start: "10:00", end: "14:00", isOpen: true },
        }),
        years_experience: 5,
        specializations: ["AC Repair", "AC Installation"],
        qualification: "Diploma in refrigeration and air conditioning",
        profile_bio:
          "Specialized in all types of AC repairs and installation with 5+ years of experience.",
        languages_spoken: ["English", "Hindi"],
        social_media_links: JSON.stringify({
          facebook: "https://facebook.com/deepakacservices",
        }),
        payment_method: "upi",
        payment_details: JSON.stringify({
          upi_id: "deepak.ac@okicici",
          phone_number: "9749877854"
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 8,
        business_type: "business",
        business_name: "Kavita's Beauty Salon",
        business_registration_number: "987654321",
        aadhar_number: "8765432109876",
        pan_number: "LMNOP9012Q",
        whatsapp_number: "0776677855",
        emergency_contact_name: "Meena Kumari",
        reference_name: "Shilpa Rao",
        reference_number: "09988776655",
        primary_location: Sequelize.fn(
          "ST_GeomFromText",
          "POINT(77.5946 12.9716)"
        ),
        exact_address: "78 Indiranagar, Bangalore, Karnataka",
        service_radius: 8,
        availability_type: "full_time",
        availability_hours: JSON.stringify({
          monday: { start: "09:00", end: "20:00", isOpen: true },
          tuesday: { start: "09:00", end: "20:00", isOpen: true },
          wednesday: { start: "09:00", end: "20:00", isOpen: true },
          thursday: { start: "09:00", end: "20:00", isOpen: true },
          friday: { start: "09:00", end: "20:00", isOpen: true },
          saturday: { start: "09:00", end: "20:00", isOpen: true },
          sunday: { start: "10:00", end: "18:00", isOpen: true },
        }),
        years_experience: 12,
        specializations: ["Waxing", "Facial", "Hair Styling"],
        qualification: "Certified beautician from VLCC Institute",
        profile_bio:
          "Professional salon services with focus on hygiene and customer satisfaction.",
        languages_spoken: ["English", "Hindi", "Kannada"],
        social_media_links: JSON.stringify({
          instagram: "https://instagram.com/kavitasalon",
          facebook: "https://facebook.com/kavitasalon"
        }),
        payment_method: "bank",
        payment_details: JSON.stringify({
          account_number: "987654321098",
          bank_name: "ICICI Bank",
          ifsc_code: "ICIC0007654",
          account_holder: "Kavita Sharma"
        }),
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      }
    ].filter(provider => !existingUserIds.has(provider.user_id));
    
    if (providersToInsert.length > 0) {
      return queryInterface.bulkInsert("service_providers", providersToInsert);
    } else {
      console.log('All service providers already exist, skipping insertion');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_providers", null, {});
  },
};