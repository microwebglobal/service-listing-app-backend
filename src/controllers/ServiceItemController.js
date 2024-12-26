const { ServiceItem, CitySpecificPricing } = require('../models');

class ServiceItemController {
  static async createServiceItem(req, res, next) {
    try {
      const newItem = await ServiceItem.create({
        item_id: req.body.item_id,
        service_id: req.body.service_id,
        name: req.body.name,
        description: req.body.description,
        base_price: req.body.base_price,
      });

      // Create city-specific pricing if provided
      if (req.body.cityPricing && Array.isArray(req.body.cityPricing)) {
        await Promise.all(
          req.body.cityPricing.map((pricing) =>
            CitySpecificPricing.create({
              city_id: pricing.city_id,
              item_id: newItem.item_id,
              item_type: 'service_item',
              price: pricing.price,
            })
          )
        );
      }

      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  }

  static async getServiceItem(req, res, next) {
    try {
      const item = await ServiceItem.findByPk(req.params.id, {
        include: [CitySpecificPricing],
      });

      if (!item) {
        return res.status(404).json({ message: 'Service item not found' });
      }

      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  static async getAllServiceItems(req, res, next) {
    try {
      const items = await ServiceItem.findAll({
        include: [CitySpecificPricing],
      });

      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceItemController;
