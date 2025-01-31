const {
  Package,
  PackageItem,
  PackageSection,
  CitySpecificPricing,
  SpecialPricing,
} = require("../models");
const IdGenerator = require("../utils/helper");
const { Op } = require("sequelize");

class PackageItemController {
  static async getPackageItems(req, res, next) {
    try {
      const currentDate = new Date();
      const items = await PackageItem.findAll({
        include: [
          {
            model: PackageSection,
            where: { package_id: req.params.id },
            attributes: ["name", "description", "display_order"],
          },
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
        order: [
          [PackageSection, "display_order", "ASC"],
          ["display_order", "ASC"],
        ],
      });

      const transformedItems = items.map((item) => ({
        item_id: item.item_id,
        name: item.name,
        description: item.description,
        price: item.price,
        is_default: item.is_default,
        is_none_option: item.is_none_option,
        display_order: item.display_order,
        city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
          const specialPrice = item.SpecialPricings?.find(
            (sp) => sp.city_id === pricing.city_id && sp.status === "active"
          );
          acc[pricing.city_id] = specialPrice
            ? specialPrice.special_price
            : pricing.price;
          return acc;
        }, {}),
        section: {
          name: item.PackageSection.name,
          description: item.PackageSection.description,
          display_order: item.PackageSection.display_order,
        },
      }));

      res.status(200).json(transformedItems);
    } catch (error) {
      next(error);
    }
  }

  // Create package item with city pricing
  static async createPackageItem(req, res, next) {
    try {
      const {
        section_id,
        name,
        price,
        description,
        is_default,
        is_none_option,
        display_order,
        city_prices,
        specialPricing, // This should now be a stringified JSON array
      } = req.body;

      console.log("Raw city_prices:", city_prices);
      console.log("Raw specialPricing:", specialPricing);

      if (!section_id || !name || price === undefined) {
        return res.status(400).json({
          error:
            "Missing required fields: section_id, name, and price are required",
        });
      }

      // Parse city_prices
      let parsedCityPrices = {};

      if (typeof city_prices === "string") {
        try {
          parsedCityPrices = JSON.parse(city_prices);
        } catch (error) {
          console.error("Invalid JSON in city_prices:", city_prices);
        }
      } else if (typeof city_prices === "object" && city_prices !== null) {
        parsedCityPrices = city_prices;
      }

      // Parse specialPricing
      let parsedSpecialPricing = [];
      if (Array.isArray(specialPricing)) {
        parsedSpecialPricing = specialPricing;
      } else if (typeof specialPricing === "string") {
        try {
          parsedSpecialPricing = JSON.parse(specialPricing);
        } catch (error) {
          console.error("Invalid JSON in specialPricing:", specialPricing);
          return res.status(400).json({
            error: "Invalid specialPricing format. Expected a JSON array.",
          });
        }
      } else {
        console.error("Unexpected specialPricing type:", typeof specialPricing);
        return res.status(400).json({
          error: "specialPricing must be an array.",
        });
      }

      const iconUrl = `/uploads/files/${req?.file?.filename}`;

      const section = await PackageSection.findByPk(section_id);
      if (!section) {
        return res.status(404).json({
          error: `Section with ID ${section_id} not found`,
        });
      }

      const existingPackageItems = await PackageItem.findAll({
        attributes: ["item_id"],
      });
      const newItemID = IdGenerator.generateId(
        "PITEM",
        existingPackageItems.map((item) => item.item_id)
      );

      const newItem = await PackageItem.create({
        item_id: newItemID,
        section_id,
        name,
        description: description || null,
        price,
        is_default: is_default || false,
        is_none_option: is_none_option || false,
        display_order: display_order || 0,
        icon_url: iconUrl,
      });

      // Handle city-specific pricing if provided
      if (parsedCityPrices && Object.keys(parsedCityPrices).length > 0) {
        const cityPricingPromises = Object.entries(parsedCityPrices).map(
          ([cityId, price]) => {
            return CitySpecificPricing.create({
              city_id: cityId,
              item_id: newItemID,
              item_type: "package_item",
              price: price,
            });
          }
        );
        await Promise.all(cityPricingPromises);
      }

      // Handle optional special pricing
      if (parsedSpecialPricing?.length > 0) {
        await Promise.all(
          parsedSpecialPricing.map(async (pricing) => {
            return SpecialPricing.create({
              item_id: newItemID,
              item_type: "package_item",
              city_id: pricing.city_id,
              special_price: pricing.special_price,
              start_date: pricing.start_date,
              end_date: pricing.end_date,
              status: "active",
            });
          })
        );
      }

      const createdItem = await PackageItem.findByPk(newItemID, {
        include: [
          {
            model: PackageSection,
            as: "PackageSections",
            attributes: ["name", "description", "display_order"],
          },
          {
            model: CitySpecificPricing,
            attributes: ["city_id", "price"],
          },
        ],
      });

      res.status(201).json({
        item_id: createdItem.item_id,
        name: createdItem.name,
        description: createdItem.description,
        price: createdItem.price,
        is_default: createdItem.is_default,
        is_none_option: createdItem.is_none_option,
        display_order: createdItem.display_order,
        city_prices: createdItem.CitySpecificPricings.reduce((acc, pricing) => {
          acc[pricing.city_id] = pricing.price;
          return acc;
        }, {}),
        section: {
          name: createdItem.PackageSections.name,
          description: createdItem.PackageSections.description,
          display_order: createdItem.PackageSections.display_order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getItemsBySectionId(req, res, next) {
    try {
      const sectionId = req.params.sectionId;
      const currentDate = new Date();
      if (!sectionId) {
        return res.status(400).json({
          error: "Section ID is required",
        });
      }

      // Check if section exists
      const section = await PackageSection.findByPk(sectionId);
      if (!section) {
        return res.status(404).json({
          error: `Section with ID ${sectionId} not found`,
        });
      }

      // Get all items for the section
      const items = await PackageItem.findAll({
        where: { section_id: sectionId },
        include: [
          {
            model: PackageSection,
            as: "PackageSections",
            attributes: ["name", "description", "display_order"],
          },
          {
            model: CitySpecificPricing,
            attributes: ["city_id", "price"],
          },
          {
            model: SpecialPricing,
            required: false,
          },
        ],
        order: [["display_order", "ASC"]],
      });

      if (!items || items.length === 0) {
        return res.status(200).json([]);
      }

      const transformedItems = items.map((item) => ({
        item_id: item.item_id,
        name: item.name,
        description: item.description,
        price: item.price,
        is_default: item.is_default,
        is_none_option: item.is_none_option,
        display_order: item.display_order,
        city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
          acc[pricing.city_id] = pricing.price;
          return acc;
        }, {}),
        special_prices: item.SpecialPricings,
        section: {
          name: item.PackageSections.name,
          description: item.PackageSections.description,
          display_order: item.PackageSections.display_order,
        },
      }));

      res.status(200).json(transformedItems);
    } catch (error) {
      next(error);
    }
  }

  // Update package item with city pricing
  static async updatePackageItem(req, res, next) {
    try {
      const itemId = req.params.id;
      const {
        name,
        description,
        price,
        is_default,
        is_none_option,
        display_order,
        section_id,
        city_prices,
        specialPricing,
      } = req.body;

      console.log(req.body);

      // Parse city_prices
      let parsedCityPrices = {};

      if (typeof city_prices === "string") {
        try {
          parsedCityPrices = JSON.parse(city_prices);
        } catch (error) {
          console.error("Invalid JSON in city_prices:", city_prices);
        }
      } else if (typeof city_prices === "object" && city_prices !== null) {
        parsedCityPrices = city_prices;
      }

      // Parse specialPricing
      let parsedSpecialPricing = [];
      if (Array.isArray(specialPricing)) {
        parsedSpecialPricing = specialPricing;
      } else if (typeof specialPricing === "string") {
        try {
          parsedSpecialPricing = JSON.parse(specialPricing);
        } catch (error) {
          console.error("Invalid JSON in specialPricing:", specialPricing);
          return res.status(400).json({
            error: "Invalid specialPricing format. Expected a JSON array.",
          });
        }
      } else {
        console.error("Unexpected specialPricing type:", typeof specialPricing);
        return res.status(400).json({
          error: "specialPricing must be an array.",
        });
      }

      const item = await PackageItem.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          error: "Package item not found",
        });
      }

      if (section_id) {
        const section = await PackageSection.findByPk(section_id);
        if (!section) {
          return res.status(404).json({
            error: `Section with ID ${section_id} not found`,
          });
        }
      }

      await item.update({
        name: name || item.name,
        description: description !== undefined ? description : item.description,
        price: price !== undefined ? price : item.price,
        is_default: is_default !== undefined ? is_default : item.is_default,
        is_none_option:
          is_none_option !== undefined ? is_none_option : item.is_none_option,
        display_order:
          display_order !== undefined ? display_order : item.display_order,
        section_id: section_id || item.section_id,
      });

      // Update city-specific pricing if provided
      if (city_prices) {
        // Delete existing pricing
        await CitySpecificPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
        });

        // Create new pricing entries
        if (parsedCityPrices && Object.keys(parsedCityPrices).length > 0) {
          const cityPricingPromises = Object.entries(parsedCityPrices).map(
            ([cityId, price]) => {
              return CitySpecificPricing.create({
                city_id: cityId,
                item_id: itemId,
                item_type: "package_item",
                price: price,
              });
            }
          );
          await Promise.all(cityPricingPromises);
        }
      }

      // Handle optional special pricing
      if (parsedSpecialPricing?.length > 0) {
        await SpecialPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
        });

        await Promise.all(
          parsedSpecialPricing.map(async (pricing) => {
            return SpecialPricing.create({
              item_id: itemId,
              item_type: "package_item",
              city_id: pricing.city_id,
              special_price: pricing.special_price,
              start_date: pricing.start_date,
              end_date: pricing.end_date,
              status: "active",
            });
          })
        );
      }

      const updatedItem = await PackageItem.findByPk(itemId, {
        include: [
          {
            model: PackageSection,
            as: "PackageSections",
            attributes: ["name", "description", "display_order"],
          },
          {
            model: CitySpecificPricing,
            attributes: ["city_id", "price"],
          },
        ],
      });

      res.status(200).json({
        item_id: updatedItem.item_id,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        is_default: updatedItem.is_default,
        is_none_option: updatedItem.is_none_option,
        display_order: updatedItem.display_order,
        city_prices: updatedItem.CitySpecificPricings.reduce((acc, pricing) => {
          acc[pricing.city_id] = pricing.price;
          return acc;
        }, {}),
        section: {
          name: updatedItem.PackageSections.name,
          description: updatedItem.PackageSections.description,
          display_order: updatedItem.PackageSections.display_order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete package item (cascades to city pricing)
  static async deletePackageItem(req, res, next) {
    try {
      const itemId = req.params.id;

      const item = await PackageItem.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          error: "Package item not found",
        });
      }

      // Delete city-specific pricing first
      await CitySpecificPricing.destroy({
        where: {
          item_id: itemId,
          item_type: "package_item",
        },
      });

      await item.destroy();

      res.status(200).json({
        message:
          "Package item and associated city pricing deleted successfully",
        item_id: itemId,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PackageItemController;
