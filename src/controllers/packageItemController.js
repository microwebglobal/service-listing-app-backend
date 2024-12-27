const { Package, PackageItem, ServiceType } = require('../models');

class PackageItemController {
    // Get all items for a package
    static async getPackageItems(req, res, next) {
      try {
        const items = await PackageItem.findAll({
          where: { package_id: req.params.packageId },
          order: [['item_id', 'ASC']]
        });
        
        res.status(200).json(items);
      } catch (error) {
        next(error);
      }
    }
  
    // Create package item
    static async createPackageItem(req, res, next) {
      try {
        const newItem = await PackageItem.create({
          item_id: req.body.item_id,
          package_id: req.body.package_id,
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          quantity: req.body.quantity
        });
        
        res.status(201).json(newItem);
      } catch (error) {
        next(error);
      }
    }
  
    // Update package item
    static async updatePackageItem(req, res, next) {
      try {
        const [updated] = await PackageItem.update(req.body, {
          where: { item_id: req.params.id }
        });
  
        if (!updated) {
          return res.status(404).json({ error: "Package item not found" });
        }
  
        const updatedItem = await PackageItem.findByPk(req.params.id);
        res.status(200).json(updatedItem);
      } catch (error) {
        next(error);
      }
    }
  
    // Delete package item
    static async deletePackageItem(req, res, next) {
      try {
        const deleted = await PackageItem.destroy({
          where: { item_id: req.params.id }
        });
  
        if (!deleted) {
          return res.status(404).json({ error: "Package item not found" });
        }
  
        res.status(200).json({ message: "Package item deleted successfully" });
      } catch (error) {
        next(error);
      }
    }
  }
  
  module.exports = PackageItemController;