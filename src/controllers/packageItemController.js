const { Package, PackageItem, PackageSection, CitySpecificPricing } = require('../models');
const IdGenerator = require('../utils/helper');

class PackageItemController {
    static async getPackageItems(req, res, next) {
      try {
        const packageId = req.params.id;
        
        if (!packageId) {
          return res.status(400).json({ 
            error: "Package ID is required" 
          });
        }

        const packageExists = await Package.findByPk(packageId);
        if (!packageExists) {
          return res.status(404).json({ 
            error: `Package with ID ${packageId} not found` 
          });
        }

        const sections = await PackageSection.findAll({
          where: { package_id: packageId }
        });

        const items = await PackageItem.findAll({
          include: [
            {
              model: PackageSection,
              where: { package_id: packageId },
              attributes: ['name', 'description', 'display_order']
            },
            {
              model: CitySpecificPricing,
              attributes: ['city_id', 'price']
            }
          ],
          order: [
            [PackageSection, 'display_order', 'ASC'],
            ['display_order', 'ASC']
          ]
        });
        
        if (!items || items.length === 0) {
          return res.status(200).json([]);
        }

        const transformedItems = items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          price: item.price,
          is_default: item.is_default,
          is_none_option: item.is_none_option,
          display_order: item.display_order,
          city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
            acc[pricing.city_id] = pricing.price;
            return acc;
          }, {}),
          section: {
            name: item.PackageSection.name,
            description: item.PackageSection.description,
            display_order: item.PackageSection.display_order
          }
        }));

        res.status(200).json(transformedItems);
      } catch (error) {
        next(error);
      }
    }

    // Create package item with city pricing
    static async createPackageItem(req, res, next) {
      try {
        const { 
          section_id, 
          name, 
          price, 
          description, 
          is_default, 
          is_none_option, 
          display_order,
          city_prices 
        } = req.body;
        
        if (!section_id || !name || price === undefined) {
          return res.status(400).json({ 
            error: "Missing required fields: section_id, name, and price are required" 
          });
        }

        const section = await PackageSection.findByPk(section_id);
        if (!section) {
          return res.status(404).json({ 
            error: `Section with ID ${section_id} not found` 
          });
        }

        const existingPackageItems = await PackageItem.findAll({
          attributes: ['item_id']
        });
        const newItemID = IdGenerator.generateId('ITEM', existingPackageItems.map(item => item.item_id));

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

        // Handle city-specific pricing if provided
        if (city_prices && Object.keys(city_prices).length > 0) {
          const cityPricingPromises = Object.entries(city_prices).map(([cityId, price]) => {
            return CitySpecificPricing.create({
              city_id: cityId,
              item_id: newItemID,
              item_type: 'package_item',
              price: price
            });
          });
          await Promise.all(cityPricingPromises);
        }
        
        const createdItem = await PackageItem.findByPk(newItemID, {
          include: [
            {
              model: PackageSection,
              attributes: ['name', 'description', 'display_order']
            },
            {
              model: CitySpecificPricing,
              attributes: ['city_id', 'price']
            }
          ]
        });

        res.status(201).json({
          item_id: createdItem.item_id,
          name: createdItem.name,
          description: createdItem.description,
          price: createdItem.price,
          is_default: createdItem.is_default,
          is_none_option: createdItem.is_none_option,
          display_order: createdItem.display_order,
          city_prices: createdItem.CitySpecificPricings.reduce((acc, pricing) => {
            acc[pricing.city_id] = pricing.price;
            return acc;
          }, {}),
          section: {
            name: createdItem.PackageSection.name,
            description: createdItem.PackageSection.description,
            display_order: createdItem.PackageSection.display_order
          }
        });
      } catch (error) {
        next(error);
      }
    }

    static async getItemsBySectionId(req, res, next) {
      try {
        const sectionId = req.params.sectionId;
        
        if (!sectionId) {
          return res.status(400).json({ 
            error: "Section ID is required" 
          });
        }
    
        // Check if section exists
        const section = await PackageSection.findByPk(sectionId);
        if (!section) {
          return res.status(404).json({ 
            error: `Section with ID ${sectionId} not found` 
          });
        }
    
        // Get all items for the section
        const items = await PackageItem.findAll({
          where: { section_id: sectionId },
          include: [
            {
              model: PackageSection,
              attributes: ['name', 'description', 'display_order']
            },
            {
              model: CitySpecificPricing,
              attributes: ['city_id', 'price']
            }
          ],
          order: [['display_order', 'ASC']]
        });
        
        if (!items || items.length === 0) {
          return res.status(200).json([]);
        }
    
        const transformedItems = items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          description: item.description,
          price: item.price,
          is_default: item.is_default,
          is_none_option: item.is_none_option,
          display_order: item.display_order,
          city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
            acc[pricing.city_id] = pricing.price;
            return acc;
          }, {}),
          section: {
            name: item.PackageSection.name,
            description: item.PackageSection.description,
            display_order: item.PackageSection.display_order
          }
        }));
    
        res.status(200).json(transformedItems);
      } catch (error) {
        next(error);
      }
    }

    // Update package item with city pricing
    static async updatePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        const { 
          name, 
          description, 
          price, 
          is_default, 
          is_none_option, 
          display_order, 
          section_id,
          city_prices 
        } = req.body;

        const item = await PackageItem.findByPk(itemId);
        if (!item) {
          return res.status(404).json({ 
            error: "Package item not found" 
          });
        }

        if (section_id) {
          const section = await PackageSection.findByPk(section_id);
          if (!section) {
            return res.status(404).json({ 
              error: `Section with ID ${section_id} not found` 
            });
          }
        }

        await item.update({
          name: name || item.name,
          description: description !== undefined ? description : item.description,
          price: price !== undefined ? price : item.price,
          is_default: is_default !== undefined ? is_default : item.is_default,
          is_none_option: is_none_option !== undefined ? is_none_option : item.is_none_option,
          display_order: display_order !== undefined ? display_order : item.display_order,
          section_id: section_id || item.section_id
        });

        // Update city-specific pricing if provided
        if (city_prices) {
          // Delete existing pricing
          await CitySpecificPricing.destroy({
            where: {
              item_id: itemId,
              item_type: 'package_item'
            }
          });

          // Create new pricing entries
          if (Object.keys(city_prices).length > 0) {
            const cityPricingPromises = Object.entries(city_prices).map(([cityId, price]) => {
              return CitySpecificPricing.create({
                city_id: cityId,
                item_id: itemId,
                item_type: 'package_item',
                price: price
              });
            });
            await Promise.all(cityPricingPromises);
          }
        }

        const updatedItem = await PackageItem.findByPk(itemId, {
          include: [
            {
              model: PackageSection,
              attributes: ['name', 'description', 'display_order']
            },
            {
              model: CitySpecificPricing,
              attributes: ['city_id', 'price']
            }
          ]
        });

        res.status(200).json({
          item_id: updatedItem.item_id,
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          is_default: updatedItem.is_default,
          is_none_option: updatedItem.is_none_option,
          display_order: updatedItem.display_order,
          city_prices: updatedItem.CitySpecificPricings.reduce((acc, pricing) => {
            acc[pricing.city_id] = pricing.price;
            return acc;
          }, {}),
          section: {
            name: updatedItem.PackageSection.name,
            description: updatedItem.PackageSection.description,
            display_order: updatedItem.PackageSection.display_order
          }
        });
      } catch (error) {
        next(error);
      }
    }

    // Delete package item (cascades to city pricing)
    static async deletePackageItem(req, res, next) {
      try {
        const itemId = req.params.id;
        
        const item = await PackageItem.findByPk(itemId);
        if (!item) {
          return res.status(404).json({ 
            error: "Package item not found" 
          });
        }

        // Delete city-specific pricing first
        await CitySpecificPricing.destroy({
          where: {
            item_id: itemId,
            item_type: 'package_item'
          }
        });

        await item.destroy();
  
        res.status(200).json({ 
          message: "Package item and associated city pricing deleted successfully",
          item_id: itemId
        });
      } catch (error) {
        next(error);
      }
    }
}

module.exports = PackageItemController;