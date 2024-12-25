
const { Service, SubCategory, CitySpecificPricing, ServiceItem } = require('../models');

class ServiceController {
  static async getAllServices(req, res, next) {
    try {
      const services = await Service.findAll({
        include: [
          { 
            model: SubCategory,
            as: 'subCategory',
            attributes: ['sub_category_id', 'name']
          },
          { 
            model: ServiceItem,
            as: 'serviceItems',
            include: [{
              model: CitySpecificPricing,
              as: 'cityPricings'
            }]
          },
          { 
            model: CitySpecificPricing,
            as: 'cityPricings'
          }
        ],
        order: [['display_order', 'ASC']]
      });
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  static async getServiceById(req, res, next) {
    try {
      const service = await Service.findByPk(req.params.id, {
        include: [
          { 
            model: SubCategory,
            as: 'subCategory',
            attributes: ['sub_category_id', 'name']
          },
          { 
            model: ServiceItem,
            as: 'serviceItems',
            include: [{
              model: CitySpecificPricing,
              as: 'cityPricings'
            }]
          },
          { 
            model: CitySpecificPricing,
            as: 'cityPricings'
          }
        ]
      });
      
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      
      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }

  static async createService(req, res, next) {
    try {
      const service = await Service.create({
        ...req.body,
        sub_category_id: req.body.subcategory_id // Ensure correct field name
      });
      
      // Handle city-specific pricing
      if (req.body.city_specific_pricing) {
        const pricingPromises = req.body.city_specific_pricing.map(pricing => 
          CitySpecificPricing.create({
            city_id: pricing.city_id,
            service_id: service.service_id,
            price: pricing.price
          })
        );
        await Promise.all(pricingPromises);
      }

      // Handle service items
      if (req.body.items) {
        const itemPromises = req.body.items.map(async item => {
          const serviceItem = await ServiceItem.create({
            ...item,
            service_id: service.service_id
          });
          
          if (item.city_specific_pricing) {
            const itemPricingPromises = item.city_specific_pricing.map(pricing =>
              CitySpecificPricing.create({
                city_id: pricing.city_id,
                item_id: serviceItem.item_id,
                price: pricing.price
              })
            );
            await Promise.all(itemPricingPromises);
          }
          return serviceItem;
        });
        await Promise.all(itemPromises);
      }

      const completeService = await Service.findByPk(service.service_id, {
        include: [
          { 
            model: SubCategory,
            as: 'subCategory',
            attributes: ['sub_category_id', 'name']
          },
          { 
            model: ServiceItem,
            as: 'serviceItems',
            include: [{
              model: CitySpecificPricing,
              as: 'cityPricings'
            }]
          },
          { 
            model: CitySpecificPricing,
            as: 'cityPricings'
          }
        ]
      });
      
      res.status(201).json(completeService);
    } catch (error) {
      next(error);
    }
  }

  static async getServicePricing(req, res, next) {
    try {
      const { service_id, city_id } = req.params;
      const pricing = await CitySpecificPricing.findOne({
        where: {
          service_id,
          city_id
        }
      });
      
      if (!pricing) {
        const service = await Service.findByPk(service_id);
        if (!service) {
          return res.status(404).json({ error: "Service not found" });
        }
        return res.status(200).json({ price: service.base_price });
      }
      
      res.status(200).json(pricing);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;