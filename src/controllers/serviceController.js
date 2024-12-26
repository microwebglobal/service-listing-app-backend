const { Service } = require('../models');

class ServiceController {
  // Get all services
  static async getAllServices(req, res, next) {
    try {
      const services = await Service.findAll({
        order: [['service_id', 'DESC']],
      });
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  // Get service by ID
  static async getServiceById(req, res, next) {
    try {
      const service = await Service.findByPk(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }

  // Create new service
  static async createService(req, res, next) {
    try {
      const newService = await Service.create({
        name: req.body.name,
        description: req.body.description,
        base_price: req.body.base_price,
        advance_percentage: req.body.advance_percentage,
        max_booking_days: req.body.max_booking_days,
        status: req.body.status || 'active',
      });
      res.status(201).json(newService);
    } catch (error) {
      next(error);
    }
  }

  // Update service
  static async updateService(req, res, next) {
    try {
      const [updated] = await Service.update(req.body, {
        where: { service_id: req.params.id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Service not found" });
      }

      const updatedService = await Service.findByPk(req.params.id);
      res.status(200).json(updatedService);
    } catch (error) {
      next(error);
    }
  }

  // Delete service
  static async deleteService(req, res, next) {
    try {
      const deleted = await Service.destroy({
        where: { service_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }

      res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Additional method for service name lookup
  static async getServiceByName(req, res, next) {
    try {
      const service = await Service.findOne({
        where: { name: req.params.name },
      });
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;
