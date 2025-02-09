const { SubCategory, ServiceType } = require('../models');
const IdGenerator = require('../utils/helper');
const path = require('path');
const fs = require('fs');

class SubCategoryController {
  static async getAllSubCategories(req, res, next) {
    try {
      const subCategories = await SubCategory.findAll({
        include: [ServiceType],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(subCategories);
    } catch (error) {
      next(error);
    }
  }

  static async getSubCategoryById(req, res, next) {
    try {
      const subCategory = await SubCategory.findByPk(req.params.id, {
        include: [ServiceType]
      });
      if (!subCategory) {
        return res.status(404).json({ error: "Sub Category not found" });
      }
      res.status(200).json(subCategory);
    } catch (error) {
      next(error);
    }
  }

  static async getSubCategoryBySlug(req, res, next) {
    try {
      const subCategory = await SubCategory.findOne({
        where: { slug: req.params.slug },
        include: [ServiceType]
      });
      if (!subCategory) {
        return res.status(404).json({ error: "Sub Category not found" });
      }
      res.status(200).json(subCategory);
    } catch (error) {
      next(error);
    }
  }

  static async getSubCategoriesByCategory(req, res, next) {
    try {
      const subCategories = await SubCategory.findAll({
        where: { category_id: req.params.categoryId },
        include: [ServiceType],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(subCategories);
    } catch (error) {
      next(error);
    }
  }

  static async createSubCategory(req, res, next) {
    try {
      console.log("File:", req.file);
      console.log("Body:", req.body);

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const iconUrl = `/uploads/images/${req.file.filename}`;

      const existingSubCategories = await SubCategory.findAll({
        attributes: ['sub_category_id']
      });
      const existingIds = existingSubCategories.map(subcat => subcat.sub_category_id);
      
      const newSubCategoryId = IdGenerator.generateId('SUB', existingIds);

      const newSubCategory = await SubCategory.create({
        sub_category_id: newSubCategoryId,
        category_id: req.body.category_id,
        name: req.body.name,
        slug: req.body.slug,
        icon_url: iconUrl,
        display_order: req.body.display_order || 0
      });

      const subCategoryWithTypes = await SubCategory.findByPk(newSubCategory.sub_category_id, {
        include: [ServiceType]
      });
      res.status(201).json(subCategoryWithTypes);
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'images', req.file.filename);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  static async updateSubCategory(req, res, next) {
    try {
      const { sub_category_id, ...updateData } = req.body;
      
      // Find the subcategory first to ensure it exists
      const oldSubCategory = await SubCategory.findByPk(req.params.id);
      if (!oldSubCategory) {
        if (req.file) {
          const filePath = path.join(__dirname, '..', 'uploads', 'images', req.file.filename);
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(404).json({ error: "Sub Category not found" });
      }

      // Handle file upload if there's a new file
      if (req.file) {
        updateData.icon_url = `/uploads/images/${req.file.filename}`;

        // Delete the old file if it exists
        if (oldSubCategory.icon_url) {
          const relativePath = oldSubCategory.icon_url.startsWith('/') 
            ? oldSubCategory.icon_url.slice(1) 
            : oldSubCategory.icon_url;
            
          const oldFilePath = path.join(__dirname, '..', relativePath);
          
          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, err => {
              if (err) console.error('Error deleting old file:', err);
            });
          }
        }
      }

      // Update the subcategory
      const [updated] = await SubCategory.update(updateData, {
        where: { sub_category_id: req.params.id }
      });

      if (!updated) {
        if (req.file) {
          const filePath = path.join(__dirname, '..', 'uploads', 'images', req.file.filename);
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(404).json({ error: "Sub Category not found" });
      }

      const updatedSubCategory = await SubCategory.findByPk(req.params.id, {
        include: [ServiceType]
      });
      res.status(200).json(updatedSubCategory);
    } catch (error) {
      // Clean up uploaded file if any error occurs
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', 'images', req.file.filename);
        fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  static async deleteSubCategory(req, res, next) {
    try {
      const subCategory = await SubCategory.findByPk(req.params.id);
      if (!subCategory) {
        return res.status(404).json({ error: "Sub Category not found" });
      }

      // Delete the associated image file if it exists
      if (subCategory.icon_url) {
        const filePath = path.join(__dirname, '..', subCategory.icon_url);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      }

      await subCategory.destroy();
      res.status(200).json({ message: "Sub Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubCategoryController;