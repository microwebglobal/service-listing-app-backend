const {
  ServiceCategory,
  SubCategory,
  CategoryCities,
  City,
  Service,
  SpecialPricing,
  CitySpecificPricing,
  ServiceType,
  ServiceItem,
} = require("../models");
const IdGenerator = require("../utils/helper");
const { Op, where } = require("sequelize");
const { sequelize } = require("../models");
const path = require("path");
const fs = require("fs");

class ServiceCategoryController {
  static async getAllCategories(req, res, next) {
    try {
      const cityId = req.query.city_id;
      if (!cityId) {
        return res.status(400).json({ error: "city_id is required" });
      }

      const categories = await ServiceCategory.findAll({
        include: [
          {
            model: SubCategory,
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

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getAllCategoriesWithoutCity(req, res, next) {
    try {
      const categories = await ServiceCategory.findAll({
        include: [SubCategory],
        order: [["display_order", "ASC"]],
      });
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const { cityId } = req.query;
      const isCityIdUndefined = cityId === "undefined" || cityId === undefined;

      const category = await ServiceCategory.findByPk(req.params.id, {
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
                        include: [
                          {
                            model: CitySpecificPricing,
                            attributes: ["price"],
                            where: {
                              city_id: cityId,
                            },
                            required: false,
                          },
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
                            attributes: ["special_price"],
                            required: false,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      console.log(
        category.SubCategories[0].ServiceTypes[0].Services[0].ServiceItems[0]
      );

      if (!category) {
        return res
          .status(404)
          .json({ error: "Category not found in this city" });
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(req, res, next) {
    try {
      // First find the city by name from the params
      const cityName = req.query.city;
      if (!cityName) {
        return res.status(400).json({ error: "city parameter is required" });
      }

      const city = await City.findOne({
        where: {
          name: {
            [Op.iLike]: cityName, // Case-insensitive comparison
          },
        },
      });

      if (!city) {
        return res.status(404).json({ error: "City not found" });
      }

      const category = await ServiceCategory.findOne({
        where: { slug: req.params.slug },
        include: [
          {
            model: SubCategory,
          },
          {
            model: CategoryCities,
            as: "categoryMappings",
            where: {
              city_id: city.city_id,
              status: "active",
            },
            required: true,
          },
        ],
      });

      if (!category) {
        return res
          .status(404)
          .json({ error: "Category not found in this city" });
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      console.log("File:", req.file);
      console.log("Body:", req.body);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse city IDs from the request body
      const cityIds = JSON.parse(req.body.cities || "[]");
      if (!Array.isArray(cityIds) || cityIds.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one city must be selected" });
      }

      const iconUrl = `/uploads/images/${req.file.filename}`;

      const existingCategories = await ServiceCategory.findAll({
        attributes: ["category_id"],
      });
      const existingIds = existingCategories.map((cat) => cat.category_id);

      const newCategoryId = IdGenerator.generateId("CAT", existingIds);

      // Create the category
      const newCategory = await ServiceCategory.create(
        {
          category_id: newCategoryId,
          name: req.body.name,
          slug: req.body.slug,
          icon_url: iconUrl,
          display_order: req.body.display_order || 0,
        },
        { transaction }
      );

      // Create city mappings
      const cityMappings = cityIds.map((cityId) => ({
        category_id: newCategoryId,
        city_id: cityId,
        status: "active",
      }));

      await CategoryCities.bulkCreate(cityMappings, { transaction });

      await transaction.commit();

      // Fetch the created category with its associations
      const categoryWithAssociations = await ServiceCategory.findByPk(
        newCategoryId,
        {
          include: [
            {
              model: City,
              as: "cities",
              through: { attributes: [] },
            },
          ],
        }
      );

      res.status(201).json(categoryWithAssociations);
    } catch (error) {
      await transaction.rollback();

      // Clean up uploaded file if database operation fails
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          req.file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { category_id, cities, ...updateData } = req.body;

      const oldCategory = await ServiceCategory.findByPk(req.params.id);
      if (!oldCategory) {
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "images",
            req.file.filename
          );
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
        return res.status(404).json({ error: "Category not found" });
      }

      // Handle file upload if there's a new file
      if (req.file) {
        updateData.icon_url = `/uploads/images/${req.file.filename}`;

        // Delete old file if it exists
        if (oldCategory.icon_url) {
          const relativePath = oldCategory.icon_url.startsWith("/")
            ? oldCategory.icon_url.slice(1)
            : oldCategory.icon_url;

          const oldFilePath = path.join(__dirname, "..", relativePath);

          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (err) => {
              if (err) console.error("Error deleting old file:", err);
            });
          }
        }
      }

      // Update category basic info
      await ServiceCategory.update(updateData, {
        where: { category_id: req.params.id },
        transaction,
      });

      // Update city mappings if provided
      if (cities) {
        const cityIds = JSON.parse(cities);

        // Delete existing mappings
        await CategoryCities.destroy({
          where: { category_id: req.params.id },
          transaction,
        });

        // Create new mappings
        if (Array.isArray(cityIds) && cityIds.length > 0) {
          const newMappings = cityIds.map((cityId) => ({
            category_id: req.params.id,
            city_id: cityId,
            status: "active",
          }));

          await CategoryCities.bulkCreate(newMappings, { transaction });
        }
      }

      await transaction.commit();

      const updatedCategory = await ServiceCategory.findByPk(req.params.id, {
        include: [
          {
            model: City,
            as: "cities",
            through: { attributes: [] },
          },
        ],
      });

      res.status(200).json(updatedCategory);
    } catch (error) {
      await transaction.rollback();

      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "images",
          req.file.filename
        );
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const category = await ServiceCategory.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Delete the associated image file if it exists
      if (category.icon_url) {
        const filePath = path.join(__dirname, "..", category.icon_url);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      }

      await category.destroy();
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ServiceCategoryController;
