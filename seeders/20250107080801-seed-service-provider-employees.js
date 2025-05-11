"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const providers = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_providers"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (providers.length === 0) {
      console.log("No providers found, skipping employee insertion");
      return Promise.resolve();
    }
    
    const users = await queryInterface.sequelize.query(
      'SELECT u_id FROM "users" WHERE role = \'business_employee\' OR u_id NOT IN (SELECT user_id FROM "service_providers")',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (users.length < 2) {
      console.log("Not enough users available for employees, skipping insertion");
      return Promise.resolve();
    }
    
    // Check existing employees
    const existingEmployees = await queryInterface.sequelize.query(
      'SELECT provider_id, user_id FROM "service_provider_employees"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const employeeKeys = new Set(existingEmployees.map(e => `${e.provider_id}-${e.user_id}`));
    
    const employeesToInsert = [];
    
    const businessProvider = providers.find(p => p.user_id === 2 || p.user_id === 8);
    
    if (businessProvider && users.length > 0) {
      const key1 = `${businessProvider.provider_id}-${users[0].u_id}`;
      if (!employeeKeys.has(key1)) {
        employeesToInsert.push({
          provider_id: businessProvider.provider_id,
          user_id: users[0].u_id,
          role: "Technician",
          qualification: "Diploma in Interior Design",
          years_experience: 5,
          whatsapp_number: "0776877854",
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
      
      if (users.length > 1) {
        const key2 = `${businessProvider.provider_id}-${users[1].u_id}`;
        if (!employeeKeys.has(key2)) {
          employeesToInsert.push({
            provider_id: businessProvider.provider_id,
            user_id: users[1].u_id,
            role: "Beautician",
            qualification: "Certified Beautician from VLCC",
            years_experience: 3,
            whatsapp_number: "0779877854",
            status: "active",
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }
    
    const anotherBusinessProvider = providers.find(p => p.user_id !== businessProvider?.user_id && (p.user_id === 2 || p.user_id === 8));
    
    if (anotherBusinessProvider && users.length > 2) {
      const key3 = `${anotherBusinessProvider.provider_id}-${users[2].u_id}`;
      if (!employeeKeys.has(key3)) {
        employeesToInsert.push({
          provider_id: anotherBusinessProvider.provider_id,
          user_id: users[2].u_id,
          role: "Senior Beautician",
          qualification: "Advanced Beautician Certification",
          years_experience: 7,
          whatsapp_number: null,
          status: "active",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }
    
    if (employeesToInsert.length > 0) {
      return queryInterface.bulkInsert("service_provider_employees", employeesToInsert);
    } else {
      console.log("All service provider employees already exist, skipping insertion");
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("service_provider_employees", null, {});
  },
};