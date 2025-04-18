const { ServiceType, Service, SubCategory } = require('../models');
const IdGenerator = require('../utils/helper');

class ServiceTypeController {
  static async getAllServiceTypes(req, res, next) {
    try {
      const types = await ServiceType.findAll({
        include: [Service],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }

  static async getServiceTypeById(req, res, next) {
    try {
      const type = await ServiceType.findByPk(req.params.id, {
        include: [Service]
      });
      if (!type) {
        return res.status(404).json({ error: "Service Type not found" });
      }
      res.status(200).json(type);
    } catch (error) {
      next(error);
    }
  }

  static async getTypesBySubCategory(req, res, next) {
    try {
      console.log('Request params:', {
        subCategoryId: req.params.subCategoryId,
        paramType: typeof req.params.subCategoryId
      });
  
      // First verify the subcategory exists
      const subCategory = await SubCategory.findByPk(req.params.subCategoryId);
      if (!subCategory) {
        console.log('Subcategory not found:', req.params.subCategoryId);
        return res.status(404).json({ error: 'Subcategory not found' });
      }
  
      const types = await ServiceType.findAll({
        where: { sub_category_id: req.params.subCategoryId },
        include: [Service],
        order: [['display_order', 'ASC']],
        logging: (sql, queryObject) => {
          console.log('Generated SQL:', sql);
          console.log('Query parameters:', queryObject.bind);
        }
      });
  
      console.log('Found types:', types.length);
      res.status(200).json(types);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        sql: error.sql,
        parameters: error.parameters
      });
      next(error);
    }
  }

  static async createServiceType(req, res, next) {
    console.log(req.body);
    try {
      console.log('File:', req.file); // Debugging
      console.log('Body:', req.body); // Debugging

       if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
         }

      const iconUrl = `/uploads/images/${req.file.filename}`;

      const existingTypes = await ServiceType.findAll({
        attributes: ['type_id']
      });
      const existingIds = existingTypes.map(type => type.type_id);
      
      // Generate new unique ID with verification
      const newTypeId = await IdGenerator.verifyUniqueId('TYP', ServiceType, 'type_id', existingIds);
      
      const newType = await ServiceType.create({
        type_id: newTypeId,
        sub_category_id: req.body.sub_category_id,
        name: req.body.name,
        icon_url: iconUrl ||"",
        description: req.body.description,
        display_order: req.body.display_order
      });
      
      const typeWithServices = await ServiceType.findByPk(newType.type_id, {
        include: [Service]
      });
      res.status(201).json(typeWithServices);
    } catch (error) {
      console.error('Error creating service type:', error);
      next(error);
    }
  }

  static async updateServiceType(req, res, next) {
    try {
      const { type_id, ...updateData } = req.body;
      const [updated] = await ServiceType.update(updateData, {
        where: { type_id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: "Service Type not found" });
      }
      const updatedType = await ServiceType.findByPk(req.params.id, {
        include: [Service]
      });
      res.status(200).json(updatedType);
    } catch (error) {
      next(error);
    }
  }

  static async deleteServiceType(req, res, next) {
    try {
      const deleted = await ServiceType.destroy({
        where: { type_id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ error: "Service Type not found" });
      }
      res.status(200).json({ message: "Service Type deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceTypeController;