const { CategoryCities, ServiceCategory, City } = require('../models');

class CategoryCitiesController {
  static async getAllCategoryMappings(req, res, next) {
    try {
      const mappings = await CategoryCities.findAll({
        include: [
          { 
            model: ServiceCategory, 
            as: 'serviceCategory',
            attributes: ['category_id', 'name'] 
          },
          { 
            model: City, 
            as: 'city',
            attributes: ['city_id', 'name'] 
          }
        ]
      });
      res.status(200).json(mappings);
    } catch (error) {
      next(error);
    }
  }

  static async getMappingsByCity(req, res, next) {
    try {
      const mappings = await CategoryCities.findAll({
        where: { city_id: req.params.cityId },
        include: [{ 
          model: ServiceCategory, 
          as: 'serviceCategory',
          attributes: ['category_id', 'name'] 
        }]
      });
      res.status(200).json(mappings);
    } catch (error) {
      next(error);
    }
  }

  static async createMapping(req, res, next) {
    try {
      const { city_id, category_id, status } = req.body;
      
      const existingMapping = await CategoryCities.findOne({
        where: { city_id, category_id }
      });

      if (existingMapping) {
        return res.status(409).json({ error: "Mapping already exists" });
      }

      const mapping = await CategoryCities.create({
        city_id,
        category_id,
        status: status || 'active'
      });

      // Fetch the created mapping with its associations
      const mappingWithAssociations = await CategoryCities.findByPk(mapping.id, {
        include: [
          { 
            model: ServiceCategory, 
            as: 'serviceCategory',
            attributes: ['category_id', 'name'] 
          },
          { 
            model: City, 
            as: 'city',
            attributes: ['city_id', 'name'] 
          }
        ]
      });

      res.status(201).json(mappingWithAssociations);
    } catch (error) {
      next(error);
    }
  }

  static async updateMapping(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [updated] = await CategoryCities.update(
        { status },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ error: "Mapping not found" });
      }

      const updatedMapping = await CategoryCities.findByPk(id, {
        include: [
          { 
            model: ServiceCategory, 
            as: 'serviceCategory',
            attributes: ['category_id', 'name'] 
          },
          { 
            model: City, 
            as: 'city',
            attributes: ['city_id', 'name'] 
          }
        ]
      });
      res.status(200).json(updatedMapping);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMapping(req, res, next) {
    try {
      const deleted = await CategoryCities.destroy({
        where: { id: req.params.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: "Mapping not found" });
      }

      res.status(200).json({ message: "Mapping deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async bulkCreateMappings(req, res, next) {
    try {
      const { mappings } = req.body;
      const createdMappings = await CategoryCities.bulkCreate(mappings, {
        ignoreDuplicates: true
      });

      // Fetch all created mappings with their associations
      const mappingsWithAssociations = await CategoryCities.findAll({
        where: {
          id: createdMappings.map(mapping => mapping.id)
        },
        include: [
          { 
            model: ServiceCategory, 
            as: 'serviceCategory',
            attributes: ['category_id', 'name'] 
          },
          { 
            model: City, 
            as: 'city',
            attributes: ['city_id', 'name'] 
          }
        ]
      });

      res.status(201).json(mappingsWithAssociations);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryCitiesController;