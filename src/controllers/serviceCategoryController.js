const { ServiceCategory, SubCategory } = require('../models');
const IdGenerator = require('../utils/helper');

class ServiceCategoryController {
  static async getAllCategories(req, res, next) {
    try {
      const categories = await ServiceCategory.findAll({
        include: [SubCategory],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const category = await ServiceCategory.findByPk(req.params.id, {
        include: [SubCategory]
      });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(req, res, next) {
    try {
      const category = await ServiceCategory.findOne({
        where: { slug: req.params.slug },
        include: [SubCategory]
      });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      // Get all existing category IDs
      const existingCategories = await ServiceCategory.findAll({
        attributes: ['category_id']
      });
      const existingIds = existingCategories.map(cat => cat.category_id);
      
      // Generate new ID
      const newCategoryId = IdGenerator.generateId('CAT', existingIds);

      const newCategory = await ServiceCategory.create({
        category_id: newCategoryId,
        name: req.body.name,
        slug: req.body.slug,
        icon_url: req.body.icon_url,
        display_order: req.body.display_order
      });
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { category_id, ...updateData } = req.body; // Remove category_id from update data
      const [updated] = await ServiceCategory.update(updateData, {
        where: { category_id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: "Category not found" });
      }
      const updatedCategory = await ServiceCategory.findByPk(req.params.id);
      res.status(200).json(updatedCategory);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const deleted = await ServiceCategory.destroy({
        where: { category_id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceCategoryController;