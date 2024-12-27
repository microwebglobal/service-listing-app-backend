const { Service, ServiceType, ServiceItem, CitySpecificPricing } = require('../models');
const IdGenerator = require('../utils/helper');

class ServiceController {
    static async getAllServices(req, res, next) {
        try {
            const services = await Service.findAll({
                include: [{
                    model: ServiceItem,
                    include: [CitySpecificPricing]
                }],
                order: [['display_order', 'ASC']]
            });
            res.status(200).json(services);
        } catch (error) {
            next(error);
        }
    }

    static async getServiceById(req, res, next) {
        try {
            const service = await Service.findByPk(req.params.id, {
                include: [{
                    model: ServiceItem,
                    include: [CitySpecificPricing]
                }]
            });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            res.status(200).json(service);
        } catch (error) {
            next(error);
        }
    }

    static async getServiceByType(req, res, next) {
        try {
            const service = await Service.findAll({
                where: { type_id: req.params.typeId },
                include: [{
                    model: ServiceItem,
                    include: [CitySpecificPricing]
                }]
            });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            res.status(200).json(service);
        } catch (error) {
            next(error);
        }
    }

    static async createService(req, res, next) {
        try {
            // Get all existing service IDs
            const existingServices = await Service.findAll({
                attributes: ['service_id']
            });
            const existingIds = existingServices.map(service => service.service_id);
            
            // Generate new ID using the utility
            const service_id = IdGenerator.generateId('SRV', existingIds);

            const newService = await Service.create({
                service_id,
                type_id: req.body.type_id,
                name: req.body.name,
                description: req.body.description,
                display_order: req.body.display_order
            });
            res.status(201).json(newService);
        } catch (error) {
            console.error('Service creation error:', error);
            next(error);
        }
    }

    static async updateService(req, res, next) {
        try {
            const { service_id, ...updateData } = req.body; // Remove service_id from update data
            const [updated] = await Service.update(updateData, {
                where: { service_id: req.params.id }
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

    static async deleteService(req, res, next) {
        try {
            const deleted = await Service.destroy({
                where: { service_id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: "Service not found" });
            }
            res.status(200).json({ message: "Service deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ServiceController;