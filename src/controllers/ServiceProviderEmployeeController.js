const {
  ServiceCategory,
  ServiceProviderEmployee,
  User,
  ServiceProvider,
  Booking,
  BookingItem,
  BookingPayment,
  ServiceItem,
  PackageItem,
  City,
} = require("../models");
const { sequelize } = require("../models");

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

  static async getEmployeeByUserId(req, res, next) {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const employees = await ServiceProviderEmployee.findOne({
        where: { user_id: req.user.id },
        include: [{ model: User }, { model: ServiceProvider }],
      });
      res.status(200).json(employees);
    } catch (error) {
      next(error);
    }
  }

  static async getEmployeeBookings(req, res, next) {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const bookings = await Booking.findAll({
        where: { employee_id: req.params.id },
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["u_id", "name", "email", "mobile"],
          },
          {
            model: ServiceProvider,
            as: "provider",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: City,
            attributes: ["city_id", "name"],
          },
          {
            model: ServiceProviderEmployee,
            as: "employee",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: BookingItem,
            include: [
              {
                model: ServiceItem,
                as: "serviceItem",
                required: false,
              },
              {
                model: PackageItem,
                as: "packageItem",
                required: false,
              },
            ],
          },
          {
            model: BookingPayment,
          },
        ],
      });
      res.status(200).json(bookings);
    } catch (error) {
      next(error);
    }
  }

  static async addEmployee(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const {
        name,
        email,
        gender,
        mobile,
        dob,
        whatsapp_number,
        nic,
        role,
        qualification,
        years_experience,
        categories,
      } = req.body;

      // Create user account for employee
      const user = await User.create(
        {
          name,
          email,
          gender,
          dob,
          nic,
          mobile,
          role: "business_employee",
        },
        {
          transaction: t,
        }
      );

      // Create employee record
      const employee = await ServiceProviderEmployee.create(
        {
          provider_id: req.params.providerId,
          user_id: user.u_id,
          role,
          whatsapp_number,
          qualification,
          years_experience,
        },
        {
          transaction: t,
        }
      );

      // Add service categories
      if (categories) {
        const categoryIds = categories.map((category) => category.value);
        await employee.addServiceCategory("CAT001");
      }

      await t.commit();

      res.status(201).json({
        message: "Employee added successfully",
        employee_id: employee.employee_id,
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async updateEmployee(req, res, next) {
    try {
      const {
        name,
        email,
        gender,
        mobile,
        dob,
        nic,
        whatsapp_number,
        role,
        qualification,
        years_experience,
        categories,
      } = req.body;
      const { employeeId } = req.params;

      const employee = await ServiceProviderEmployee.findByPk(employeeId, {
        include: [{ model: User }, { model: ServiceCategory }],
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Update user details
      await User.update(
        { name, email, gender, mobile, dob, nic },
        { where: { u_id: employee.user_id } }
      );

      // Update employee details
      await employee.update({
        role,
        whatsapp_number,
        qualification,
        years_experience,
      });

      // Update categories if provided
      if (categories) {
        await employee.setServiceCategories(categories);
      }

      res.status(200).json({ message: "Employee updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;

      const employee = await ServiceProviderEmployee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Delete the associated user
      await User.destroy({ where: { u_id: employee.user_id } });

      // Delete the employee record
      await employee.destroy();

      res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceProviderEmployeeController;
