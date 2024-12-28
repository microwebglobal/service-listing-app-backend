const { Package, PackageItem, PackageSection, ServiceType } = require('../models');
const IdGenerator = require('../utils/helper');

class PackageItemController {
    // Get all items for a package
    static async getPackageItems(req, res, next) {
      try {
        const packageId = req.params.id;
        
        if (!packageId) {
          return res.status(400).json({ 
            error: "Package ID is required" 
          });
        }

        // First verify if package exists
        const packageExists = await Package.findByPk(packageId);
        if (!packageExists) {
          return res.status(404).json({ 
            error: `Package with ID ${packageId} not found` 
          });
        }

        // Get all sections for this package
        const sections = await PackageSection.findAll({
          where: { package_id: packageId }
        });

        const sectionIds = sections.map(section => section.section_id);

        // Get all items from these sections
        const items = await PackageItem.findAll({
          include: [{
            model: PackageSection,
            where: { package_id: packageId },
            attributes: ['name', 'description', 'display_order']
          }],
          order: [
            [PackageSection, 'display_order', 'ASC'],
            ['display_order', 'ASC']
          ]
        });
        
        if (!items || items.length === 0) {
          return res.status(200).json([]);
        }

        // Transform the response to include section information
        const transformedItems = items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          price: item.price,
          is_default: item.is_default,
          is_none_option: item.is_none_option,
          display_order: item.display_order,
          section: {
            name: item.PackageSection.name,
            description: item.PackageSection.description,
            display_order: item.PackageSection.display_order
          }
        }));

        res.status(200).json(transformedItems);
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ 
            error: "Invalid package ID format" 
          });
        }
        next(error);
      }
    }
  
    // Create package item
    static async createPackageItem(req, res, next) {
      try {
        const { section_id, name, price, description, is_default, is_none_option, display_order } = req.body;
        
        // Validate required fields
        if (!section_id || !name || price === undefined) {
          return res.status(400).json({ 
            error: "Missing required fields: section_id, name, and price are required" 
          });
        }

        // Verify if section exists
        const section = await PackageSection.findByPk(section_id);
        if (!section) {
          return res.status(404).json({ 
            error: `Section with ID ${section_id} not found` 
          });
        }

        const existingPackageItems = await PackageItem.findAll({
          attributes: ['item_id']
        });
        const existingIds = existingPackageItems.map(item => item.item_id);
        
        const newItemID = IdGenerator.generateId('ITEM', existingIds);

        const newItem = await PackageItem.create({
          item_id: newItemID,
          section_id,
          name,
          description: description || null,
          price,
          is_default: is_default || false,
          is_none_option: is_none_option || false,
          display_order: display_order || 0
        });
        
        // Fetch the created item with section information
        const createdItem = await PackageItem.findByPk(newItemID, {
          include: [{
            model: PackageSection,
            attributes: ['name', 'description', 'display_order']
          }]
        });

        res.status(201).json({
          item_id: createdItem.item_id,
          name: createdItem.name,
          description: createdItem.description,
          price: createdItem.price,
          is_default: createdItem.is_default,
          is_none_option: createdItem.is_none_option,
          display_order: createdItem.display_order,
          section: {
            name: createdItem.PackageSection.name,
            description: createdItem.PackageSection.description,
            display_order: createdItem.PackageSection.display_order
          }
        });
      } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(400).json({ 
            error: "Invalid section_id - section does not exist" 
          });
        }
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ 
            error: "Invalid data format",
            details: error.errors.map(err => err.message)
          });
        }
        next(error);
      }
    }
  
    // Update package item
    static async updatePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        const { name, description, price, is_default, is_none_option, display_order, section_id } = req.body;

        // Find the item first
        const item = await PackageItem.findByPk(itemId);
        if (!item) {
          return res.status(404).json({ 
            error: "Package item not found" 
          });
        }

        // If section_id is provided, verify it exists
        if (section_id) {
          const section = await PackageSection.findByPk(section_id);
          if (!section) {
            return res.status(404).json({ 
              error: `Section with ID ${section_id} not found` 
            });
          }
        }

        // Update the item
        await item.update({
          name: name || item.name,
          description: description !== undefined ? description : item.description,
          price: price !== undefined ? price : item.price,
          is_default: is_default !== undefined ? is_default : item.is_default,
          is_none_option: is_none_option !== undefined ? is_none_option : item.is_none_option,
          display_order: display_order !== undefined ? display_order : item.display_order,
          section_id: section_id || item.section_id
        });

        // Fetch updated item with section information
        const updatedItem = await PackageItem.findByPk(itemId, {
          include: [{
            model: PackageSection,
            attributes: ['name', 'description', 'display_order']
          }]
        });

        res.status(200).json({
          item_id: updatedItem.item_id,
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          is_default: updatedItem.is_default,
          is_none_option: updatedItem.is_none_option,
          display_order: updatedItem.display_order,
          section: {
            name: updatedItem.PackageSection.name,
            description: updatedItem.PackageSection.description,
            display_order: updatedItem.PackageSection.display_order
          }
        });
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ 
            error: "Invalid data format",
            details: error.errors.map(err => err.message)
          });
        }
        next(error);
      }
    }
  
    // Delete package item
    static async deletePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        
        // Find the item first
        const item = await PackageItem.findByPk(itemId);
        if (!item) {
          return res.status(404).json({ 
            error: "Package item not found" 
          });
        }

        await item.destroy();
  
        res.status(200).json({ 
          message: "Package item deleted successfully",
          item_id: itemId
        });
      } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(400).json({ 
            error: "Cannot delete item as it is referenced by other records" 
          });
        }
        next(error);
      }
    }
}
  
module.exports = PackageItemController;