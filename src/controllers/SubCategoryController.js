const { SubCategory, ServiceType } = require('../models');

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
      const newSubCategory = await SubCategory.create({
        sub_category_id: req.body.sub_category_id,
        category_id: req.body.category_id,
        name: req.body.name,
        slug: req.body.slug,
        display_order: req.body.display_order
      });
      res.status(201).json(newSubCategory);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubCategoryController;