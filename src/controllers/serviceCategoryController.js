const { ServiceCategory, SubCategory } = require('../models');

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

  static async createCategory(req, res, next) {
    try {
      const newCategory = await ServiceCategory.create({
        category_id: req.body.category_id,
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
      const [updated] = await ServiceCategory.update(req.body, {
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