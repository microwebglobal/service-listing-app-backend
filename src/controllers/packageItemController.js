const { Package, PackageItem, ServiceType } = require('../models');
const IdGenerator = require('../utils/helper');

class PackageItemController {
    // Get all items for a package
    static async getPackageItems(req, res, next) {
      try {
        // Validate package_id parameter
        const packageId = req.params.id; // 
        if (!packageId) {
          return res.status(400).json({ error: "Package ID is required" });
        }

        const items = await PackageItem.findAll({
          where: { package_id: packageId },
          order: [['item_id', 'ASC']]
        });
        
        // Return empty array if no items found
        if (!items.length) {
          return res.status(200).json([]);
        }

        res.status(200).json(items);
      } catch (error) {
        next(error);
      }
    }
  
    // Create package item
    static async createPackageItem(req, res, next) {
      try {
        // Validate required fields
        const { package_id, name, price, quantity } = req.body;
        if (!package_id || !name || price === undefined || quantity === undefined) {
          return res.status(400).json({ 
            error: "Missing required fields: package_id, name, price, and quantity are required" 
          });
        }

        const existingPackageItems = await PackageItem.findAll({
          attributes: ['item_id']
        });
        const existingIds = existingPackageItems.map(item => item.item_id);
        
        // Generate new ID
        const newPackageItemId = IdGenerator.generateId('PITEM', existingIds);

        const newItem = await PackageItem.create({
          item_id: newPackageItemId,
          package_id,
          name,
          description: req.body.description || null,
          price,
          quantity
        });
        
        res.status(201).json(newItem);
      } catch (error) {
        // Handle specific database errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(400).json({ error: "Invalid package_id - package does not exist" });
        }
        next(error);
      }
    }
  
    // Update package item
    static async updatePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        const { item_id, ...updateData } = req.body;

        // Prevent updating the item_id
        if (item_id) {
          delete updateData.item_id;
        }

        const [updated] = await PackageItem.update(updateData, {
          where: { item_id: itemId }
        });
  
        if (!updated) {
          return res.status(404).json({ error: "Package item not found" });
        }
  
        const updatedItem = await PackageItem.findByPk(itemId);
        res.status(200).json(updatedItem);
      } catch (error) {
        next(error);
      }
    }
  
    // Delete package item
    static async deletePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        const deleted = await PackageItem.destroy({
          where: { item_id: itemId }
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