"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const employees = await queryInterface.sequelize.query(
      'SELECT employee_id FROM "service_provider_employees"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (employees.length === 0) {
      const providers = await queryInterface.sequelize.query(
        'SELECT provider_id, user_id FROM "service_providers"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const rajProviderId = providers.find(p => p.user_id === 2)?.provider_id;
      
      if (rajProviderId) {
        await queryInterface.bulkInsert("service_provider_employees", [
          {
            provider_id: rajProviderId,
            user_id: 3, // Anand Employee
            role: "Painter",
            qualification: "Diploma in Interior Design",
            years_experience: 5,
            whatsapp_number: "0776877854",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            provider_id: rajProviderId,
            user_id: 4, // Priya Employee
            role: "Home Cleaner",
            qualification: "Certified House Cleaning Professional",
            years_experience: 3,
            whatsapp_number: "0779877854",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          }
        ]);
      }
    }
    
    const updatedEmployees = await queryInterface.sequelize.query(
      'SELECT employee_id, provider_id FROM "service_provider_employees"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    
    const existingMappings = await queryInterface.sequelize.query(
      'SELECT employee_id, category_id FROM "employee_service_categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const mappingKeys = new Set(existingMappings.map(m => `${m.employee_id}-${m.category_id}`));
    
    // t
    const mappingsToInsert = [];
    
    for (const employee of updatedEmployees) {
      //  provider categ
      const providerCategories = await queryInterface.sequelize.query(
        `SELECT category_id FROM "provider_service_categories" WHERE provider_id = ${employee.provider_id}`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      for (const category of providerCategories) {
        const key = `${employee.employee_id}-${category.category_id}`;
        if (!mappingKeys.has(key)) {
          mappingsToInsert.push({
            employee_id: employee.employee_id,
            category_id: category.category_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    
    if (mappingsToInsert.length > 0) {
      return queryInterface.bulkInsert("employee_service_categories", mappingsToInsert);
    } else {
      console.log('All employee service categories already exist, skipping insertion');
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("employee_service_categories", null, {});
  },
};