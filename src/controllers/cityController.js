const { City, ServiceCategory, CitySpecificPricing } = require('../models');
const IdGenerator = require('../utils/helper');

class CityController {
  static async getAllCities(req, res, next) {
    try {
      const cities = await City.findAll({
        order: [['name', 'ASC']],
        include: [{
          model: ServiceCategory,
          as: 'serviceCategories',  // Added alias
          through: { attributes: [] }
        }]
      });
      res.status(200).json(cities);
    } catch (error) {
      next(error);
    }
  }

  static async getCityById(req, res, next) {
    try {
      const city = await City.findByPk(req.params.id, {
        include: [{
          model: ServiceCategory,
          as: 'serviceCategories',  // Added alias
          through: { attributes: [] }
        }]
      });
      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }
      res.status(200).json(city);
    } catch (error) {
      next(error);
    }
  }

  static async createCity(req, res, next) {
    try {
      // Get all existing city IDs
      const existingCities = await City.findAll({
        attributes: ['city_id']
      });
      const existingIds = existingCities.map(city => city.city_id);

      // Generate a unique city ID with prefix 'CTY'
      const cityId = await IdGenerator.verifyUniqueId('CTY', City, 'city_id', existingIds);

      const newCity = await City.create({
        city_id: cityId,
        name: req.body.name,
        state: req.body.state,
        status: req.body.status || 'active', // Default status
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });

      // Fetch the created city with its associations
      const cityWithAssociations = await City.findByPk(newCity.city_id, {
        include: [{
          model: ServiceCategory,
          as: 'serviceCategories',  // Added alias
          through: { attributes: [] }
        }]
      });

      res.status(201).json(cityWithAssociations);
    } catch (error) {
      next(error);
    }
  }

  static async updateCity(req, res, next) {
    try {
      // Prevent city_id from being updated
      const { city_id, ...updateData } = req.body;
      
      const [updated] = await City.update(updateData, {
        where: { city_id: req.params.id }
      });
      
      if (!updated) {
        return res.status(404).json({ error: "City not found" });
      }
      
      // Fetch the updated city with its associations
      const updatedCity = await City.findByPk(req.params.id, {
        include: [{
          model: ServiceCategory,
          as: 'serviceCategories',  // Added alias
          through: { attributes: [] }
        }]
      });
      
      res.status(200).json(updatedCity);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCity(req, res, next) {
    try {
      const deleted = await City.destroy({
        where: { city_id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ error: "City not found" });
      }
      
      res.status(200).json({ message: "City deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CityController;