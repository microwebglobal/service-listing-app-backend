const { City, ServiceCategory, CitySpecificPricing } = require('../models');

class CityController {
  static async getAllCities(req, res, next) {
    try {
      const cities = await City.findAll({
        order: [['name', 'ASC']],
        include: [{
          model: ServiceCategory,
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
      const newCity = await City.create({
        city_id: req.body.city_id,
        name: req.body.name,
        state: req.body.state,
        status: req.body.status,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });
      res.status(201).json(newCity);
    } catch (error) {
      next(error);
    }
  }

  static async updateCity(req, res, next) {
    try {
      const [updated] = await City.update(req.body, {
        where: { city_id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ error: "City not found" });
      }
      const updatedCity = await City.findByPk(req.params.id);
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