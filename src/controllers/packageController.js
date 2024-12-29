const { Package, PackageSection, PackageItem, ServiceType } = require('../models');
const IdGenerator = require('../utils/helper');

class PackageController {
  // Get all packages with sections and items
  static async getAllPackages(req, res, next) {
    try {
      const packages = await Package.findAll({
        include: [
          {
            model: ServiceType,
            attributes: ['name', 'description']
          },
          {
            model: PackageSection,
            include: [{
              model: PackageItem,
              order: [['display_order', 'ASC']]
            }],
            order: [['display_order', 'ASC']]
          }
        ],
        order: [['display_order', 'ASC']]
      });

      if (!packages || packages.length === 0) {
        return res.status(404).json({
          message: 'No packages found'
        });
      }

      const packagesWithPrice = packages.map(pkg => {
        const defaultPrice = pkg.PackageSections.reduce((total, section) => {
          const defaultItems = section.PackageItems.filter(item => item.is_default);
          return total + defaultItems.reduce((sum, item) => sum + Number(item.price), 0);
        }, 0);

        return {
          ...pkg.toJSON(),
          default_price: defaultPrice
        };
      });

      res.status(200).json(packagesWithPrice);
    } catch (error) {
      next(error);
    }
  }

  // Delete package by ID
  static async deletePackage(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: 'Package ID is required'
        });
      }

      const pkg = await Package.findByPk(id);

      if (!pkg) {
        return res.status(404).json({
          message: `Package with ID ${id} not found`
        });
      }

      await pkg.destroy();
      res.status(200).json({
        message: 'Package deleted successfully',
        packageId: id
      });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          message: 'Cannot delete package as it is referenced by other records'
        });
      }
      next(error);
    }
  }

  // Update package by ID
  static async updatePackage(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, type_id, duration_hours, duration_minutes, sections } = req.body;

      if (!id) {
        return res.status(400).json({
          message: 'Package ID is required'
        });
      }

      // Validate required fields
      if (!name || !type_id || (!duration_hours && !duration_minutes)) {
        return res.status(400).json({
          message: 'Missing required fields: name, type_id, and either duration_hours or duration_minutes are required'
        });
      }

      const pkg = await Package.findByPk(id);

      if (!pkg) {
        return res.status(404).json({
          message: `Package with ID ${id} not found`
        });
      }

      await pkg.update({
        name,
        description,
        type_id,
        duration_hours,
        duration_minutes
      });

      // Update sections and items
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          if (!section.name) {
            return res.status(400).json({
              message: 'Section name is required'
            });
          }

          let updatedSection = await PackageSection.findOne({
            where: {
              section_id: section.section_id,
              package_id: id
            }
          });

          if (updatedSection) {
            await updatedSection.update({
              name: section.name,
              description: section.description,
              display_order: section.display_order
            });
          } else {
            const newSectionID = IdGenerator.generateId('SECT', []);
            updatedSection = await PackageSection.create({
              section_id: newSectionID,
              package_id: id,
              name: section.name,
              description: section.description,
              display_order: section.display_order
            });
          }

          if (section.items && Array.isArray(section.items)) {
            for (const item of section.items) {
              if (!item.name || typeof item.price !== 'number') {
                return res.status(400).json({
                  message: 'Item name and price are required for all items'
                });
              }

              let updatedItem = await PackageItem.findOne({
                where: {
                  item_id: item.item_id,
                  section_id: updatedSection.section_id
                }
              });

              if (updatedItem) {
                await updatedItem.update({
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  is_default: item.is_default,
                  is_none_option: item.is_none_option,
                  display_order: item.display_order
                });
              } else {
                const newItemID = IdGenerator.generateId('ITEM', []);
                await PackageItem.create({
                  item_id: newItemID,
                  section_id: updatedSection.section_id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  is_default: item.is_default || false,
                  is_none_option: item.is_none_option || false,
                  display_order: item.display_order
                });
              }
            }
          }
        }
      }

      // Return updated package
      const updatedPackage = await PackageController.getPackageById(req, res, next);
      return updatedPackage;
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Invalid data format',
          errors: error.errors.map(err => err.message)
        });
      }
      next(error);
    }
  }

  // Get packages by type
  static async getPackagesByType(req, res, next) {
    try {
      const { typeId } = req.params;  // Changed from type_id to typeId to match route parameter
      console.log('Received typeId:', typeId);

      if (!typeId) {
        return res.status(400).json({
          message: 'Service type ID is required'
        });
      }
  
      // First verify if the service type exists
      const serviceType = await ServiceType.findByPk(typeId);
      console.log('Found service type:', serviceType);

      if (!serviceType) {
        return res.status(404).json({
          message: `Service type with ID ${typeId} not found`
        });
      }
  
      const packages = await Package.findAll({
        where: { type_id: typeId },  // Map the route parameter to the database column name
        include: [
          {
            model: ServiceType,
            attributes: ['name', 'description']
          },
          {
            model: PackageSection,
            include: [{
              model: PackageItem,
              order: [['display_order', 'ASC']]
            }],
            order: [['display_order', 'ASC']]
          }
        ],
        order: [['display_order', 'ASC']]
      });
  
      if (!packages || packages.length === 0) {
        return res.status(404).json({
          message: `No packages found for service type ${typeId}`
        });
      }
  
      const packagesWithPrice = packages.map(pkg => {
        const defaultPrice = pkg.PackageSections.reduce((total, section) => {
          const defaultItems = section.PackageItems.filter(item => item.is_default);
          return total + defaultItems.reduce((sum, item) => sum + Number(item.price), 0);
        }, 0);
  
        return {
          ...pkg.toJSON(),
          default_price: defaultPrice
        };
      });
  
      res.status(200).json(packagesWithPrice);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Invalid service type ID format'
        });
      }
      next(error);
    }
  }

  // Get package by ID
  static async getPackageById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: 'Package ID is required'
        });
      }

      const pkg = await Package.findByPk(id, {
        include: [
          {
            model: ServiceType,
            attributes: ['name', 'description']
          },
          {
            model: PackageSection,
            include: [{
              model: PackageItem,
              order: [['display_order', 'ASC']]
            }],
            order: [['display_order', 'ASC']]
          }
        ]
      });

      if (!pkg) {
        return res.status(404).json({
          message: `Package with ID ${id} not found`
        });
      }

      const defaultPrice = pkg.PackageSections.reduce((total, section) => {
        const defaultItems = section.PackageItems.filter(item => item.is_default);
        return total + defaultItems.reduce((sum, item) => sum + Number(item.price), 0);
      }, 0);

      const packageWithPrice = {
        ...pkg.toJSON(),
        default_price: defaultPrice
      };

      res.status(200).json(packageWithPrice);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Invalid package ID format'
        });
      }
      next(error);
    }
  }

  // Create new package
  static async createPackage(req, res, next) {
    try {
      const {
        name,
        description,
        type_id,
        duration_hours,
        duration_minutes,
        sections
      } = req.body;

      // Validate required fields
      if (!name || !type_id || (!duration_hours && !duration_minutes)) {
        return res.status(400).json({
          message: 'Missing required fields: name, type_id, and either duration_hours or duration_minutes are required'
        });
      }

      // Verify if service type exists
      const serviceType = await ServiceType.findByPk(type_id);
      if (!serviceType) {
        return res.status(404).json({
          message: `Service type with ID ${type_id} not found`
        });
      }

      const existingPackages = await Package.findAll({
        attributes: ['package_id']
      });
      const existingIds = existingPackages.map(pkg => pkg.package_id);
      const newPackageID = await IdGenerator.verifyUniqueId('PKG', Package, 'package_id', existingIds);

      const newPackage = await Package.create({
        package_id: newPackageID,
        name,
        description,
        type_id,
        duration_hours,
        duration_minutes
      });

      if (sections && Array.isArray(sections)) {
        for (const [sectionIndex, section] of sections.entries()) {
          if (!section.name) {
            return res.status(400).json({
              message: 'Section name is required'
            });
          }

          const sectionId = IdGenerator.generateId('SECT', []);
          const newSection = await PackageSection.create({
            section_id: sectionId,
            package_id: newPackageID,
            name: section.name,
            description: section.description,
            display_order: sectionIndex
          });

          if (section.items && Array.isArray(section.items)) {
            const items = [
              ...section.items,
              {
                name: `I don't want ${section.name}`,
                price: 0,
                is_default: false,
                is_none_option: true,
                display_order: section.items.length
              }
            ];

            for (const [itemIndex, item] of items.entries()) {
              if (!item.name || typeof item.price !== 'number') {
                return res.status(400).json({
                  message: 'Item name and price are required for all items'
                });
              }

              await PackageItem.create({
                item_id: IdGenerator.generateId('ITEM', []),
                section_id: sectionId,
                name: item.name,
                description: item.description || null,
                price: item.price,
                is_default: item.is_default || false,
                is_none_option: item.is_none_option || false,
                display_order: itemIndex
              });
            }
          }
        }
      }

      // Fetch the created package with all relations
      const createdPackage = await Package.findByPk(newPackageID, {
        include: [{
          model: PackageSection,
          include: [{
            model: PackageItem,
            order: [['display_order', 'ASC']]
          }],
          order: [['display_order', 'ASC']]
        }]
      });

      const defaultPrice = createdPackage.PackageSections.reduce((total, section) => {
        const defaultItems = section.PackageItems.filter(item => item.is_default);
        return total + defaultItems.reduce((sum, item) => sum + Number(item.price), 0);
      }, 0);

      res.status(201).json({
        ...createdPackage.toJSON(),
        default_price: defaultPrice
      });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: 'Invalid data format',
          errors: error.errors.map(err => err.message)
        });
      }
      next(error);
    }
  }
}

module.exports = PackageController;