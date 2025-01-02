const { ServiceItem, CitySpecificPricing } = require('../models');
const IdGenerator = require('../utils/helper');

class ServiceItemController {
  static async createServiceItem(req, res, next) {
    try {
      const existingItems = await ServiceItem.findAll({
        attributes: ['item_id']
      });
  
      const newItemId = IdGenerator.generateId('ITM', existingItems.map(item => item.item_id));
  
      const newItem = await ServiceItem.create({
        item_id: newItemId,
        service_id: req.body.service_id,
        name: req.body.name,
        description: req.body.description,
        overview: req.body.overview,
        base_price: req.body.base_price,
      });
  
      // Handle optional city-specific pricing
      if (req.body.cityPricing?.length > 0) {
        await Promise.all(
          req.body.cityPricing.map(async (pricing) => {
            return CitySpecificPricing.create({
              city_id: pricing.city_id,
              item_id: newItem.item_id,
              item_type: 'service_item',
              price: pricing.price,
            });
          })
        );
      }
  
      // Fetch the created item with its pricing details
      const itemWithPricing = await ServiceItem.findByPk(newItem.item_id, {
        include: [CitySpecificPricing]
      });
  
      res.status(201).json(itemWithPricing);
    } catch (error) {
      console.error('Service Item Creation Error:', error);
      next(error);
    }
  }
  
  static async updateServiceItem(req, res, next) {
    try {
      const { item_id, cityPricing, ...updateData } = req.body;
      const [updated] = await ServiceItem.update(updateData, {
        where: { item_id: req.params.id }
      });

      if (!updated) {
        return res.status(404).json({ message: 'Service item not found' });
      }

      // Handle optional city-specific pricing update
      if (cityPricing?.length >= 0) {
        // Delete existing pricing
        await CitySpecificPricing.destroy({
          where: {
            item_id: req.params.id,
            item_type: 'service_item'
          }
        });

        // Create new pricing entries if provided
        if (cityPricing.length > 0) {
          await Promise.all(
            cityPricing.map(async (pricing) => {
              return CitySpecificPricing.create({
                city_id: pricing.city_id,
                item_id: req.params.id,
                item_type: 'service_item',
                price: pricing.price,
              });
            })
          );
        }
      }

      const updatedItem = await ServiceItem.findByPk(req.params.id, {
        include: [CitySpecificPricing]
      });
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Service Item Update Error:', error);
      next(error);
    }
  }
  
  static async getServiceItem(req, res, next) {
    try {
      const currentDate = new Date();
      const item = await ServiceItem.findByPk(req.params.id, {
        include: [
          {
            model: CitySpecificPricing,
            attributes: ['city_id', 'price']
          },
          {
            model: SpecialPricing,
            where: {
              status: 'active',
              start_date: { [Op.lte]: currentDate },
              end_date: { [Op.gte]: currentDate }
            },
            required: false
          }
        ]
      });
  
      if (!item) {
        return res.status(404).json({ message: 'Service item not found' });
      }
  
      // Transform the response to include special pricing
      const transformedItem = {
        ...item.toJSON(),
        city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
          const specialPrice = item.SpecialPricings?.find(sp => 
            sp.city_id === pricing.city_id && 
            sp.status === 'active'
          );
          acc[pricing.city_id] = specialPrice ? specialPrice.special_price : pricing.price;
          return acc;
        }, {})
      };
  
      res.status(200).json(transformedItem);
    } catch (error) {
      next(error);
    }
  }

  
  static async getServiceItemByService(req, res, next) {
    try {
      const items = await ServiceItem.findAll({
        where: { service_id: req.params.serviceId },
        include: [CitySpecificPricing]
      });
      res.status(200).json(items);
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

  

  static async deleteServiceItem(req, res, next) {
    try {
      const deleted = await ServiceItem.destroy({
        where: { item_id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ message: 'Service item not found' });
      }

      res.status(200).json({ message: 'Service item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceItemController;