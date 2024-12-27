const { SubCategory, ServiceType } = require('../models');
const IdGenerator = require('../utils/helper');

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
      const existingSubCategories = await SubCategory.findAll({
        attributes: ['sub_category_id']
      });
      const existingIds = existingSubCategories.map(subcat => subcat.sub_category_id);
      
      // Generate new ID
      const newSubCategoryId = IdGenerator.generateId('SUB', existingIds);

      const newSubCategory = await SubCategory.create({
        sub_category_id: newSubCategoryId,
        category_id: req.body.category_id,
        name: req.body.name,
        slug: req.body.slug,
        display_order: req.body.display_order
      });

      const subCategoryWithTypes = await SubCategory.findByPk(newSubCategory.sub_category_id, {
        include: [ServiceType]
      });
      res.status(201).json(subCategoryWithTypes);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubCategory(req, res, next) {
    try {
      const { sub_category_id, ...updateData } = req.body;
      const [updated] = await SubCategory.update(updateData, {
        where: { sub_category_id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: "Sub Category not found" });
      }
      const updatedSubCategory = await SubCategory.findByPk(req.params.id, {
        include: [ServiceType]
      });
      res.status(200).json(updatedSubCategory);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubCategory(req, res, next) {
    try {
      const deleted = await SubCategory.destroy({
        where: { sub_category_id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: "Sub Category not found" });
      }
      res.status(200).json({ message: "Sub Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubCategoryController;