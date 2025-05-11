'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingCities = await queryInterface.sequelize.query(
      'SELECT city_id FROM "cities"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingCityIds = new Set(existingCities.map(city => city.city_id));
    
    const citiesToInsert = [
      {
        city_id: 'CTY001',
        name: 'Mumbai',
        state: 'Maharashtra',
        status: 'active',
        latitude: 19.0760,
        longitude: 72.8777,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY002',
        name: 'Delhi',
        state: 'Delhi',
        status: 'active',
        latitude: 28.7041,
        longitude: 77.1025,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY003',
        name: 'Bangalore',
        state: 'Karnataka',
        status: 'active',
        latitude: 12.9716,
        longitude: 77.5946,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY004',
        name: 'Chennai',
        state: 'Tamil Nadu',
        status: 'active',
        latitude: 13.0827,
        longitude: 80.2707,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 'CTY005',
        name: 'Hyderabad',
        state: 'Telangana',
        status: 'active',
        latitude: 17.3850,
        longitude: 78.4867,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(city => !existingCityIds.has(city.city_id));
    
    if (citiesToInsert.length === 0) {
      console.log('All cities already exist, skipping insertion');
      return Promise.resolve();
    }
    
    return queryInterface.bulkInsert('cities', citiesToInsert);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('cities', null, {});
  }
};