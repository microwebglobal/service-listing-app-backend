const {
  ServiceItem,
  CitySpecificPricing,
  SubCategory,
  Service,
  City,
  ServiceType,
  CategoryCities,
  ServiceCategory,
  SpecialPricing,
  CitySpecificBuffertime,
  ServiceCommission,
} = require("../models");

const IdGenerator = require("../utils/helper");
const { Op, where } = require("sequelize");

class ServiceItemController {
  static async createServiceItem(req, res, next) {
    console.log(req.body);
    console.log(req.body.bufferTime);
    try {
      const existingItems = await ServiceItem.findAll({
        attributes: ["item_id"],
      });

      const newItemId = IdGenerator.generateId(
        "ITM",
        existingItems.map((item) => item.item_id)
      );

      const newItem = await ServiceItem.create({
        item_id: newItemId,
        service_id: req.body.service_id,
        name: req.body.name,
        duration_hours: req.body?.duration_hours,
        duration_minutes: req.body?.duration_minutes,
        description: req.body.description,
        overview: req.body.overview,
        base_price: req.body.base_price,
        grace_period: req.body.grace_period || null,
        penalty_percentage: req.body.penalty_percentage || null,
        advance_percentage: req.body.advance_percentage || 0,
        is_home_visit: req.body.is_home_visit,
      });

      // Handle optional city-specific pricing
      if (req.body.cityPricing?.length > 0) {
        await Promise.all(
          req.body.cityPricing.map(async (pricing) => {
            return CitySpecificPricing.create({
              city_id: pricing.city_id,
              item_id: newItem.item_id,
              item_type: "service_item",
              price: pricing.price,
            });
          })
        );
      }

      // Handle optional special pricing
      if (req.body.specialPricing?.length > 0) {
        await Promise.all(
          req.body.specialPricing.map(async (pricing) => {
            return SpecialPricing.create({
              item_id: newItem.item_id,
              item_type: "service_item",
              city_id: pricing.city_id,
              special_price: pricing.special_price,
              start_date: pricing.start_date,
              end_date: pricing.end_date,
              status: "active",
            });
          })
        );
      }

      // Handle optional buffer times
      if (req.body.bufferTime?.length > 0) {
        await Promise.all(
          req.body.bufferTime.map(async (time) => {
            return CitySpecificBuffertime.create({
              item_id: newItem.item_id,
              item_type: "service_item",
              city_id: time.city_id,
              buffer_hours: Math.floor(time.buffer_hours),
              buffer_minutes: Math.floor(time.buffer_minutes),
            });
          })
        );
      }

      // Handle commition rates
      if (req.body.commitionRate?.length > 0) {
        await Promise.all(
          req.body.commitionRate.map(async (commition) => {
            return ServiceCommission.create({
              city_id: commition.city_id,
              item_id: newItem.item_id,
              item_type: "service_item",
              commission_rate: commition.rate,
            });
          })
        );
      }

      // Fetch the created item with its pricing details
      const itemWithPricing = await ServiceItem.findByPk(newItem.item_id, {
        include: [CitySpecificPricing],
      });

      res.status(201).json(itemWithPricing);
    } catch (error) {
      console.error("Service Item Creation Error:", error);
      next(error);
    }
  }

  static async updateServiceItem(req, res, next) {
    try {
      const {
        item_id,
        cityPricing,
        specialPricing,
        bufferTime,
        commitionRate,
        ...updateData
      } = req.body;
      const [updated] = await ServiceItem.update(updateData, {
        where: { item_id: req.params.id },
      });

      console.log(req.body);

      if (!updated) {
        return res.status(404).json({ message: "Service item not found" });
      }

      // Handle optional city-specific pricing update
      if (cityPricing?.length >= 0) {
        // Delete existing pricing
        await CitySpecificPricing.destroy({
          where: {
            item_id: req.params.id,
            item_type: "service_item",
          },
        });

        // Create new pricing entries if provided
        if (cityPricing.length > 0) {
          await Promise.all(
            cityPricing.map(async (pricing) => {
              return CitySpecificPricing.create({
                city_id: pricing.city_id,
                item_id: req.params.id,
                item_type: "service_item",
                price: pricing.price,
              });
            })
          );
        }
      }

      // Handle optional special pricing update
      if (specialPricing?.length >= 0) {
        // Delete existing pricing
        await SpecialPricing.destroy({
          where: {
            item_id: req.params.id,
            item_type: "service_item",
          },
        });

        // Create new pricing entries if provided
        if (specialPricing.length > 0) {
          await Promise.all(
            specialPricing.map(async (pricing) => {
              return SpecialPricing.create({
                item_id: req.params.id,
                item_type: "service_item",
                city_id: pricing.city_id,
                special_price: pricing.special_price,
                start_date: pricing.start_date,
                end_date: pricing.end_date,
                status: "active",
              });
            })
          );
        }
      }

      // Handle optional buffer time update
      if (bufferTime?.length >= 0) {
        // Delete existing buffer time
        await CitySpecificBuffertime.destroy({
          where: {
            item_id: req.params.id,
            item_type: "service_item",
          },
        });

        // Create new buffer time entries if provided
        if (bufferTime.length > 0) {
          await Promise.all(
            bufferTime.map(async (time) => {
              return CitySpecificBuffertime.create({
                item_id: req.params.id,
                item_type: "service_item",
                city_id: time.city_id,
                buffer_hours: Math.floor(time.buffer_hours),
                buffer_minutes: Math.floor(time.buffer_minutes),
              });
            })
          );
        }
      }

      //Handle Commition rates updates
      if (commitionRate?.length >= 0) {
        // Delete existing pricing
        await ServiceCommission.destroy({
          where: {
            item_id: req.params.id,
            item_type: "service_item",
          },
        });

        // Create new pricing entries if provided
        if (commitionRate.length > 0) {
          await Promise.all(
            commitionRate.map(async (commition) => {
              return ServiceCommission.create({
                city_id: commition.city_id,
                item_id: req.params.id,
                item_type: "service_item",
                commission_rate: commition.rate,
              });
            })
          );
        }
      }

      const updatedItem = await ServiceItem.findByPk(req.params.id, {
        include: [CitySpecificPricing],
      });
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Service Item Update Error:", error);
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
            attributes: ["city_id", "price"],
          },
          {
            model: SpecialPricing,
            where: {
              status: "active",
              start_date: { [Op.lte]: currentDate },
              end_date: { [Op.gte]: currentDate },
            },
            required: false,
          },
        ],
      });

      if (!item) {
        return res.status(404).json({ message: "Service item not found" });
      }

      // Transform the response to include special pricing
      const transformedItem = {
        ...item.toJSON(),
        city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
          const specialPrice = item.SpecialPricings?.find(
            (sp) => sp.city_id === pricing.city_id && sp.status === "active"
          );
          acc[pricing.city_id] = specialPrice
            ? specialPrice.special_price
            : pricing.price;
          return acc;
        }, {}),
      };

      res.status(200).json(transformedItem);
    } catch (error) {
      next(error);
    }
  }

  static async getServiceItemByService(req, res, next) {
    try {
      const { cityId } = req.query;
      const isCityIdUndefined = cityId === "undefined" || cityId === undefined;

      const items = await ServiceItem.findAll({
        where: { service_id: req.params.serviceId },
        include: [
          CitySpecificPricing,
          CitySpecificBuffertime,
          ServiceCommission,
          {
            model: SpecialPricing,
            where: {
              status: "active",
              ...(isCityIdUndefined
                ? {}
                : {
                    city_id: cityId,
                    start_date: { [Op.lte]: new Date() },
                    end_date: { [Op.gte]: new Date() },
                  }),
            },
            required: false,
          },
        ],
      });

      if (!items || items.length === 0) {
        return res
          .status(200)
          .json({ message: "No service items found for the given service" });
      }

      const transformedItems = items.map((item) => {
        let basePrice = item.base_price;

        if (cityId) {
          const cityPricing = item.CitySpecificPricings.find(
            (pricing) => pricing.city_id === cityId
          );
          if (cityPricing) {
            basePrice = cityPricing.price;
          }
        }

        return {
          ...item.toJSON(),
          base_price: basePrice,
        };
      });

      res.status(200).json(transformedItems);
    } catch (error) {
      console.error("Error fetching service items by service:", error);
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
        where: { item_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Service item not found" });
      }

      res.status(200).json({ message: "Service item deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async getServiceItemByCity(req, res, next) {
    try {
      const { cityName } = req.params;

      if (!cityName) {
        return res.status(400).json({ error: "cityName is required" });
      }

      const city = await City.findOne({
        where: {
          name: {
            [Op.iLike]: cityName,
          },
        },
      });

      if (!city) {
        return res.status(400).json({ error: "City not found" });
      }

      const cityId = city.city_id;

      const categories = await ServiceCategory.findAll({
        include: [
          {
            model: SubCategory,
            include: [
              {
                model: ServiceType,
                include: [
                  {
                    model: Service,
                    include: [
                      {
                        model: ServiceItem,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: CategoryCities,
            as: "categoryMappings",
            where: {
              city_id: cityId,
              status: "active",
            },
            required: true,
          },
        ],
        order: [["display_order", "ASC"]],
      });

      const serviceItems = [];

      for (const category of categories) {
        for (const subCategory of category.SubCategories || []) {
          for (const serviceType of subCategory.ServiceTypes || []) {
            for (const service of serviceType.Services || []) {
              for (const item of service.ServiceItems || []) {
                serviceItems.push(item);
              }
            }
          }
        }
      }

      return res.status(200).json(serviceItems);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceItemController;
