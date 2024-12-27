const { ServiceType, Service, SubCategory } = require('../models');

class ServiceTypeController {
  static async getTypesBySubCategory(req, res, next) {
    try {
      const types = await ServiceType.findAll({
        where: { sub_category_id: req.params.subCategoryId },
        include: [Service],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }

  static async createServiceType(req, res, next) {
    try {
      const newType = await ServiceType.create({
        type_id: req.body.type_id,
        sub_category_id: req.body.sub_category_id,
        name: req.body.name,
        description: req.body.description,
        display_order: req.body.display_order
      });
      res.status(201).json(newType);
    } catch (error) {
      next(error);
    }
  }

  static async deleteServiceType(req, res, next) {
    try {
      const deleted = await ServiceType.destroy({
        where: { type_id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: "Service Type not found" });
      }
      res.status(200).json({ message: "Service Type deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceTypeController;