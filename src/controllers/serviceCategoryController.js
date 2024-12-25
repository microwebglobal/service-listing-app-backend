const { ServiceCategory, SubCategory, Service, City } = require('../models');
const slugify = require('slugify');

class ServiceCategoryController {
  static async getAllCategories(req, res, next) {
    try {
      const categories = await ServiceCategory.findAll({
        include: [{
          model: SubCategory,
          as: 'subcategories',
          include: [{
            model: Service,
            as: 'services'
          }]
        }, {
          model: City,
          as: 'cities',
          attributes: ['city_id', 'name']
        }],
        order: [
          ['display_order', 'ASC'],
          [{ model: SubCategory, as: 'subcategories' }, 'display_order', 'ASC'],
          [{ model: SubCategory, as: 'subcategories' }, { model: Service, as: 'services' }, 'display_order', 'ASC']
        ]
      });
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      // Generate slug from name
      const slug = slugify(req.body.name, { lower: true });
      
      const category = await ServiceCategory.create({
        ...req.body,
        slug
      });

      if (req.body.available_cities) {
        await category.setCities(req.body.available_cities);
      }

      // Fetch the created category with its relationships
      const completeCategory = await ServiceCategory.findByPk(category.category_id, {
        include: [{
          model: City,
          as: 'cities',
          attributes: ['city_id', 'name']
        }]
      });

      res.status(201).json(completeCategory);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      // Update slug if name is being updated
      if (req.body.name) {
        req.body.slug = slugify(req.body.name, { lower: true });
      }

      const [updated] = await ServiceCategory.update(req.body, {
        where: { category_id: req.params.id }
      });

      if (!updated) {
        return res.status(404).json({ error: "Category not found" });
      }

      const category = await ServiceCategory.findByPk(req.params.id);
      if (req.body.available_cities) {
        await category.setCities(req.body.available_cities);
      }

      // Fetch the updated category with its relationships
      const completeCategory = await ServiceCategory.findByPk(req.params.id, {
        include: [{
          model: City,
          as: 'cities',
          attributes: ['city_id', 'name']
        }]
      });

      res.status(200).json(completeCategory);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceCategoryController;