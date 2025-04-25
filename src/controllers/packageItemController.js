const {
  Package,
  PackageItem,
  PackageSection,
  CitySpecificPricing,
  SpecialPricing,
  sequelize,
} = require("../models");
const IdGenerator = require("../utils/helper");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

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
        icon_url: item.icon_url,
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

      res.status(200).json({
        status: "success",
        data: transformedItems,
        message: items.length
          ? "Package items retrieved successfully"
          : "No items found",
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPackageItem(req, res, next) {
    const transaction = await sequelize.transaction();
    console.log(req.body);
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
        specialPricing,
      } = req.body;

      // Validate required fields
      if (!section_id || !name || price === undefined) {
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "files",
            req.file.filename
          );
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields: section_id, name, and price are required",
        });
      }

      // Validate section existence
      const section = await PackageSection.findByPk(section_id);
      if (!section) {
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "files",
            req.file.filename
          );
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(404).json({
          status: "error",
          message: `Section with ID ${section_id} not found`,
        });
      }

      // Parse city_prices and specialPricing
      const parsedCityPrices =
        PackageItemController.parsePriceData(city_prices);
      const parsedSpecialPricing =
        PackageItemController.parseSpecialPricing(specialPricing);
      if (parsedSpecialPricing.error) {
        return res.status(400).json({
          status: "error",
          message: parsedSpecialPricing.error,
        });
      }

      // Handle file upload
      let iconUrl = null;
      if (req.file) {
        iconUrl = `/uploads/files/${req.file.filename}`;
      }

      // Generate new item ID
      const existingPackageItems = await PackageItem.findAll({
        attributes: ["item_id"],
      });
      const newItemID = IdGenerator.generateId(
        "PITEM",
        existingPackageItems.map((item) => item.item_id)
      );

      // Create package item
      const newItem = await PackageItem.create(
        {
          item_id: newItemID,
          section_id,
          name,
          description: description || null,
          price,
          is_default: is_default || false,
          is_none_option: is_none_option || false,
          display_order: display_order || 0,
          icon_url: iconUrl,
        },
        { transaction }
      );

      // Create city-specific pricing
      if (parsedCityPrices && Object.keys(parsedCityPrices).length > 0) {
        await Promise.all(
          Object.entries(parsedCityPrices).map(([cityId, price]) =>
            CitySpecificPricing.create(
              {
                city_id: cityId,
                item_id: newItemID,
                item_type: "package_item",
                price: price,
              },
              { transaction }
            )
          )
        );
      }

      // Create special pricing
      if (parsedSpecialPricing.data?.length > 0) {
        await Promise.all(
          parsedSpecialPricing.data.map((pricing) =>
            SpecialPricing.create(
              {
                item_id: newItemID,
                item_type: "package_item",
                city_id: pricing.city_id,
                special_price: pricing.special_price,
                start_date: pricing.start_date,
                end_date: pricing.end_date,
                status: "active",
              },
              { transaction }
            )
          )
        );
      }

      await transaction.commit();

      // Fetch created item with associations
      const createdItem = await PackageItem.findByPk(newItemID, {
        include: [
          {
            model: PackageSection,
            attributes: ["name", "description", "display_order"],
          },
          {
            model: CitySpecificPricing,
            attributes: ["city_id", "price"],
          },
          {
            model: SpecialPricing,
            where: { status: "active" },
            required: false,
          },
        ],
      });

      res.status(201).json({
        status: "success",
        data: PackageItemController.transformItemResponse(createdItem),
        message: "Package item created successfully",
      });
    } catch (error) {
      await transaction.rollback();

      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "files",
          req.file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      next(error);
    }
  }

  static async updatePackageItem(req, res, next) {
    const transaction = await sequelize.transaction();

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

      // Find existing item
      const item = await PackageItem.findByPk(itemId);
      if (!item) {
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "files",
            req.file.filename
          );
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(404).json({
          status: "error",
          message: "Package item not found",
        });
      }

      // Validate section if provided
      if (section_id) {
        const section = await PackageSection.findByPk(section_id);
        if (!section) {
          if (req.file) {
            const filePath = path.join(
              __dirname,
              "..",
              "uploads",
              "files",
              req.file.filename
            );
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          }
          return res.status(404).json({
            status: "error",
            message: `Section with ID ${section_id} not found`,
          });
        }
      }

      // Handle file upload
      if (req.file) {
        const iconUrl = `/uploads/files/${req.file.filename}`;

        // Delete old file if exists
        if (item.icon_url) {
          const relativePath = item.icon_url.startsWith("/")
            ? item.icon_url.slice(1)
            : item.icon_url;

          const oldFilePath = path.join(__dirname, "..", relativePath);

          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (err) => {
              if (err) console.error("Error deleting old file:", err);
            });
          }
        }

        await item.update({ icon_url: iconUrl }, { transaction });
      }

      // Update item
      await item.update(
        {
          name: name || item.name,
          description:
            description !== undefined ? description : item.description,
          price: price !== undefined ? price : item.price,
          is_default: is_default !== undefined ? is_default : item.is_default,
          is_none_option:
            is_none_option !== undefined ? is_none_option : item.is_none_option,
          display_order:
            display_order !== undefined ? display_order : item.display_order,
          section_id: section_id || item.section_id,
        },
        { transaction }
      );

      // Update city-specific pricing
      if (city_prices) {
        const parsedCityPrices =
          PackageItemController.parsePriceData(city_prices);

        await CitySpecificPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
          transaction,
        });

        if (Object.keys(parsedCityPrices).length > 0) {
          await Promise.all(
            Object.entries(parsedCityPrices).map(([cityId, price]) =>
              CitySpecificPricing.create(
                {
                  city_id: cityId,
                  item_id: itemId,
                  item_type: "package_item",
                  price: price,
                },
                { transaction }
              )
            )
          );
        }
      }

      // Update special pricing
      if (specialPricing) {
        const parsedSpecialPricing =
          PackageItemController.parseSpecialPricing(specialPricing);
        if (parsedSpecialPricing.error) {
          return res.status(400).json({
            status: "error",
            message: parsedSpecialPricing.error,
          });
        }

        await SpecialPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
          transaction,
        });

        if (parsedSpecialPricing.data?.length > 0) {
          await Promise.all(
            parsedSpecialPricing.data.map((pricing) =>
              SpecialPricing.create(
                {
                  item_id: itemId,
                  item_type: "package_item",
                  city_id: pricing.city_id,
                  special_price: pricing.special_price,
                  start_date: pricing.start_date,
                  end_date: pricing.end_date,
                  status: "active",
                },
                { transaction }
              )
            )
          );
        }
      }

      await transaction.commit();

      // Fetch updated item with associations
      const updatedItem = await PackageItem.findByPk(itemId, {
        include: [
          {
            model: PackageSection,
            attributes: ["name", "description", "display_order"],
          },
          {
            model: CitySpecificPricing,
            attributes: ["city_id", "price"],
          },
          {
            model: SpecialPricing,
            where: { status: "active" },
            required: false,
          },
        ],
      });

      res.status(200).json({
        status: "success",
        data: PackageItemController.transformItemResponse(updatedItem),
        message: "Package item updated successfully",
      });
    } catch (error) {
      await transaction.rollback();

      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "files",
          req.file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      next(error);
    }
  }

  static async deletePackageItem(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const itemId = req.params.id;

      const item = await PackageItem.findByPk(itemId);
      if (!item) {
        return res.status(404).json({
          status: "error",
          message: "Package item not found",
        });
      }

      // Delete associated file if exists
      if (item.icon_url) {
        const relativePath = item.icon_url.startsWith("/")
          ? item.icon_url.slice(1)
          : item.icon_url;

        const filePath = path.join(__dirname, "..", relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      }

      // Delete associated data
      await Promise.all([
        CitySpecificPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
          transaction,
        }),
        SpecialPricing.destroy({
          where: {
            item_id: itemId,
            item_type: "package_item",
          },
          transaction,
        }),
        item.destroy({ transaction }),
      ]);

      await transaction.commit();

      res.status(200).json({
        status: "success",
        message: "Package item and associated data deleted successfully",
        data: { item_id: itemId },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  static async getItemsBySectionId(req, res, next) {
    try {
      const sectionId = req.params.sectionId;
      const currentDate = new Date();

      // Validate section existence
      const section = await PackageSection.findByPk(sectionId);
      if (!section) {
        return res.status(404).json({
          status: "error",
          message: `Section with ID ${sectionId} not found`,
        });
      }

      // Get items with associations
      const items = await PackageItem.findAll({
        where: { section_id: sectionId },
        include: [
          {
            model: PackageSection,
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
        order: [["display_order", "ASC"]],
      });

      items.map((item) => console.log(item.dataValues, "||||")),
        res.status(200).json({
          status: "success",
          data: items.map((item) =>
            PackageItemController.transformItemResponse(item.dataValues)
          ),
          message: items.length
            ? "Items retrieved successfully"
            : "No items found for this section",
        });
    } catch (error) {
      next(error);
    }
  }

  // Utility methods
  static parsePriceData(priceData) {
    let parsedData = {};

    if (typeof priceData === "string") {
      try {
        parsedData = JSON.parse(priceData);
      } catch (error) {
        console.error("Invalid JSON in price data:", priceData);
      }
    } else if (typeof priceData === "object" && priceData !== null) {
      parsedData = priceData;
    }

    return parsedData;
  }

  static parseSpecialPricing(specialPricing) {
    if (Array.isArray(specialPricing)) {
      return { data: specialPricing };
    }

    if (typeof specialPricing === "string") {
      try {
        const parsed = JSON.parse(specialPricing);
        if (!Array.isArray(parsed)) {
          return { error: "Special pricing must be an array" };
        }
        return { data: parsed };
      } catch (error) {
        return { error: "Invalid special pricing format" };
      }
    }

    return { data: [] };
  }

  static transformItemResponse(item) {
    return {
      item_id: item.item_id,
      name: item.name,
      description: item.description,
      price: item.price,
      is_default: item.is_default,
      is_none_option: item.is_none_option,
      display_order: item.display_order,
      icon_url: item.icon_url,
      city_prices: item.CitySpecificPricings.reduce((acc, pricing) => {
        const specialPrice = item.SpecialPricings?.find(
          (sp) => sp.city_id === pricing.city_id && sp.status === "active"
        );
        acc[pricing.city_id] = specialPrice
          ? specialPrice.special_price
          : pricing.price;
        return acc;
      }, {}),
      special_prices: item.SpecialPricings || [],
      section: item.PackageSection
        ? {
            name: item.PackageSection.name,
            description: item.PackageSection.description,
            display_order: item.PackageSection.display_order,
          }
        : null,
    };
  }
}

module.exports = PackageItemController;
