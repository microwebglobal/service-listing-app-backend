const { ServiceCategory, ServiceProviderEmployee, User } = require("../models");

class ServiceProviderEmployeeController {
  static async getAllEmployees(req, res, next) {
    try {
      const employees = await ServiceProviderEmployee.findAll({
        where: { provider_id: req.params.providerId },
        include: [{ model: User }, { model: ServiceCategory }],
      });
      res.status(200).json(employees);
    } catch (error) {
      next(error);
    }
  }

  static async addEmployee(req, res, next) {
    try {
      const {
        name,
        email,
        mobile,
        role,
        qualification,
        years_experience,
        categories,
      } = req.body;

      // Create user account for employee
      const user = await User.create({
        name,
        email,
        mobile,
        role: "service_provider",
      });

      // Create employee record
      const employee = await ServiceProviderEmployee.create({
        provider_id: req.params.providerId,
        user_id: user.u_id,
        role,
        qualification,
        years_experience,
      });

      // Add service categories
      await employee.setServiceCategories(categories);

      res.status(201).json({
        message: "Employee added successfully",
        employee_id: employee.employee_id,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceProviderEmployeeController;
