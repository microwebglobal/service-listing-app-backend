const {
  PackageSection,
  PackageItem,
  CitySpecificPricing,
  SpecialPricing,
  Package
} = require("../models");
const IdGenerator = require("../utils/helper");
const path = require('path');
const fs = require('fs');

class PackageSectionController {
  static async getSectionsByPackage(req, res, next) {
    try {
      // First verify if the package exists
      const packages = await Package.findByPk(req.params.packageId);
      if (!packages) {
        return res.status(404).json({
          status: "error",
          message: "Package not found"
        });
      }
  
      const sections = await PackageSection.findAll({
        where: { package_id: req.params.packageId },
        include: [{
          model: PackageItem,
          required: false
        }],
        order: [["display_order", "ASC"]]
      });
  
      return res.status(200).json({
        status: "success",
        data: sections,
        message: sections.length ? "Sections retrieved successfully" : "No sections found for this package"
      });
    } catch (error) {
      // Add better error logging
      console.error('Detailed error:', error);
      next(error);
    }
  }
  static async createSection(req, res, next) {
    try {
      const { package_id, name, description, display_order, items } = req.body;

      // Validate package existence
      const existingPackage = await Package.findByPk(package_id);
      if (!existingPackage) {
        if (req.file) {
          const filePath = path.join(__dirname, '..', 'uploads', 'files', req.file.filename);
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(404).json({
          status: "error",
          message: "Package not found"
        });
      }

      // Handle file upload
      let iconUrl = null;
      if (req.file) {
        iconUrl = `/uploads/files/${req.file.filename}`;
      }

      // Generate new section ID
      const existingSections = await PackageSection.findAll({
        attributes: ["section_id"],
      });
      const existingIds = existingSections.map((section) => section.section_id);
      const newSectionID = IdGenerator.generateId("SECT", existingIds);

      // Create section
      const section = await PackageSection.create({
        section_id: newSectionID,
        package_id,
        name,
        description,
        display_order: display_order || 0,
        icon_url: iconUrl,
      });

      // Create items if provided
      if (items && Array.isArray(items)) {
        const itemController = require("./packageItemController");
        for (const item of items) {
          await itemController.createItem({
            ...item,
            section_id: newSectionID,
          });
        }
      }

      // Fetch created section with its items
      const createdSection = await PackageSection.findByPk(newSectionID, {
        include: [
          {
            model: PackageItem,
            include: [
              { model: CitySpecificPricing },
              { model: SpecialPricing },
            ],
          },
        ],
      });

      res.status(201).json({
        status: "success",
        data: createdSection,
        message: "Section created successfully"
      });
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'files', req.file.filename);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const { section_id, ...updateData } = req.body;

      // Find the section first
      const existingSection = await PackageSection.findByPk(req.params.id);
      if (!existingSection) {
        if (req.file) {
          const filePath = path.join(__dirname, '..', 'uploads', 'files', req.file.filename);
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(404).json({
          status: "error",
          message: "Section not found"
        });
      }

      // Handle file upload
      if (req.file) {
        updateData.icon_url = `/uploads/files/${req.file.filename}`;

        // Delete old file if exists
        if (existingSection.icon_url) {
          const relativePath = existingSection.icon_url.startsWith('/') 
            ? existingSection.icon_url.slice(1) 
            : existingSection.icon_url;
            
          const oldFilePath = path.join(__dirname, '..', relativePath);
          
          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, err => {
              if (err) console.error('Error deleting old file:', err);
            });
          }
        }
      }

      // Update section
      await PackageSection.update(updateData, {
        where: { section_id: req.params.id },
      });

      // Fetch updated section with its items
      const updatedSection = await PackageSection.findByPk(req.params.id, {
        include: [
          {
            model: PackageItem,
            include: [
              { model: CitySpecificPricing },
              { model: SpecialPricing },
            ],
          },
        ],
      });

      res.status(200).json({
        status: "success",
        data: updatedSection,
        message: "Section updated successfully"
      });
    } catch (error) {
      // Clean up uploaded file if any error occurs
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'files', req.file.filename);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      const section = await PackageSection.findByPk(req.params.id);
      if (!section) {
        return res.status(404).json({
          status: "error",
          message: "Section not found"
        });
      }

      // Delete the associated image file if it exists
      if (section.icon_url) {
        const relativePath = section.icon_url.startsWith('/') 
          ? section.icon_url.slice(1) 
          : section.icon_url;
          
        const filePath = path.join(__dirname, '..', relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      }

      // Delete section (this will cascade delete items due to foreign key constraints)
      await section.destroy();

      res.status(200).json({
        status: "success",
        message: "Section and associated items deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSectionById(req, res, next) {
    try {
      const section = await PackageSection.findByPk(req.params.id, {
        include: [
          {
            model: PackageItem,
            include: [
              { 
                model: CitySpecificPricing,
                where: { status: 'active' },
                required: false
              },
              { 
                model: SpecialPricing,
                where: { status: 'active' },
                required: false
              },
            ],
          },
        ],
      });

      if (!section) {
        return res.status(404).json({
          status: "error",
          message: "Section not found"
        });
      }

      res.status(200).json({
        status: "success",
        data: section,
        message: "Section retrieved successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PackageSectionController;