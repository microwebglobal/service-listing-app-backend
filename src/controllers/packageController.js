const { Package, PackageItem, ServiceType } = require('../models');

class PackageController {
  // Get all packages
  static async getAllPackages(req, res, next) {
    try {
      const packages = await Package.findAll({
        include: [
          {
            model: ServiceType,
            attributes: ['name', 'description']
          },
          {
            model: PackageItem,
            attributes: ['item_id', 'name', 'description', 'price', 'quantity']
          }
        ],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(packages);
    } catch (error) {
      next(error);
    }
  }

  // Get package by ID
  static async getPackageById(req, res, next) {
    try {
      const packageData = await Package.findByPk(req.params.id, {
        include: [
          {
            model: ServiceType,
            attributes: ['name', 'description']
          },
          {
            model: PackageItem,
            attributes: ['item_id', 'name', 'description', 'price', 'quantity']
          }
        ]
      });
      
      if (!packageData) {
        return res.status(404).json({ error: "Package not found" });
      }
      
      res.status(200).json(packageData);
    } catch (error) {
      next(error);
    }
  }

  // Get packages by service type
  static async getPackagesByType(req, res, next) {
    try {
      const packages = await Package.findAll({
        where: { type_id: req.params.typeId },
        include: [{
          model: PackageItem,
          attributes: ['item_id', 'name', 'description', 'price', 'quantity']
        }],
        order: [['display_order', 'ASC']]
      });
      
      res.status(200).json(packages);
    } catch (error) {
      next(error);
    }
  }

  // Create new package
  static async createPackage(req, res, next) {
    try {
      const newPackage = await Package.create({
        package_id: req.body.package_id,
        type_id: req.body.type_id,
        name: req.body.name,
        description: req.body.description,
        base_price: req.body.base_price,
        display_order: req.body.display_order
      });
      
      res.status(201).json(newPackage);
    } catch (error) {
      next(error);
    }
  }

  // Update package
  static async updatePackage(req, res, next) {
    try {
      const [updated] = await Package.update(req.body, {
        where: { package_id: req.params.id }
      });

      if (!updated) {
        return res.status(404).json({ error: "Package not found" });
      }

      const updatedPackage = await Package.findByPk(req.params.id);
      res.status(200).json(updatedPackage);
    } catch (error) {
      next(error);
    }
  }

  // Delete package
  static async deletePackage(req, res, next) {
    try {
      const deleted = await Package.destroy({
        where: { package_id: req.params.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.status(200).json({ message: "Package deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = PackageController;