const {
  Package,
  PackageSection,
  PackageItem,
  ServiceType,
  CitySpecificBuffertime,
  ServiceCommission,
  sequelize,
} = require("../models");
const IdGenerator = require("../utils/helper");
const path = require("path");
const fs = require("fs");

class PackageController {
  static async getAllPackages(req, res, next) {
    try {
      const packages = await Package.findAll({
        include: [
          {
            model: ServiceType,
            attributes: ["name", "description"],
          },
          {
            model: CitySpecificBuffertime,
          },
          {
            model: ServiceCommission,
          },
          {
            model: PackageSection,
            include: [
              {
                model: PackageItem,
              },
            ],
          },
        ],
        order: [
          ["display_order", "ASC"],
          [PackageSection, "display_order", "ASC"],
          [PackageSection, PackageItem, "display_order", "ASC"],
        ],
      });

      const packagesWithPrice = packages.map((pkg) => {
        const defaultPrice = pkg.PackageSections.reduce((total, section) => {
          const defaultItems = section.PackageItems.filter(
            (item) => item.is_default
          );
          return (
            total +
            defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
          );
        }, 0);

        return {
          ...pkg.toJSON(),
          default_price: defaultPrice,
        };
      });

      res.status(200).json({
        status: "success",
        data: packagesWithPrice,
        message: packages.length
          ? "Packages retrieved successfully"
          : "No packages found",
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPackage(req, res, next) {
    const transaction = await sequelize.transaction();
    console.log(req.body);
    try {
      let {
        name,
        description,
        type_id,
        duration_hours,
        duration_minutes,
        grace_period,
        penalty_percentage,
        advance_percentage,
        sections,
        bufferTime,
        commitionRate,
      } = req.body;

      // parse
      if (typeof bufferTime === "string") {
        try {
          bufferTime = JSON.parse(bufferTime);
        } catch (e) {
          bufferTime = [];
        }
      }

      if (typeof commitionRate === "string") {
        try {
          commitionRate = JSON.parse(commitionRate);
        } catch (e) {
          commitionRate = [];
        }
      }

      // logger
      console.log("Parsed bufferTime:", bufferTime);
      console.log("Parsed commitionRate:", commitionRate);

      // Validate required fields
      if (!name || !type_id || (!duration_hours && !duration_minutes)) {
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
            "Missing required fields: name, type_id, and either duration_hours or duration_minutes",
        });
      }

      // Verify service type
      const serviceType = await ServiceType.findByPk(type_id);
      if (!serviceType) {
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
          message: `Service type with ID ${type_id} not found`,
        });
      }

      // Handle file upload
      let iconUrl = null;
      if (req.file) {
        iconUrl = `/uploads/files/${req.file.filename}`;
      }

      // Generate new package ID
      const existingPackages = await Package.findAll({
        attributes: ["package_id"],
      });
      const existingIds = existingPackages.map((pkg) => pkg.package_id);
      const newPackageID = await IdGenerator.verifyUniqueId(
        "PKG",
        Package,
        "package_id",
        existingIds
      );

      if (bufferTime?.length > 0) {
        await Promise.all(
          bufferTime.map(async (time) => {
            return CitySpecificBuffertime.create(
              {
                item_id: newPackageID,
                item_type: "package",
                city_id: time.city_id,
                buffer_hours: Math.floor(time.buffer_hours),
                buffer_minutes: Math.floor(time.buffer_minutes),
              },
              { transaction }
            );
          })
        );
      }

      if (commitionRate?.length > 0) {
        await Promise.all(
          commitionRate.map(async (commition) => {
            return ServiceCommission.create(
              {
                city_id: commition.city_id,
                item_id: newPackageID,
                item_type: "package",
                commission_rate: commition.rate,
              },
              { transaction }
            );
          })
        );
      }

      // Create package
      const newPackage = await Package.create(
        {
          package_id: newPackageID,
          name,
          description,
          type_id,
          duration_hours,
          duration_minutes,
          grace_period,
          penalty_percentage,
          advance_percentage,
          icon_url: iconUrl,
        },
        { transaction }
      );

      // Create sections and items
      if (sections && Array.isArray(sections)) {
        for (const [sectionIndex, section] of sections.entries()) {
          if (!section.name) {
            throw new Error("Section name is required");
          }

          const sectionId = IdGenerator.generateId("SECT", []);
          const newSection = await PackageSection.create(
            {
              section_id: sectionId,
              package_id: newPackageID,
              name: section.name,
              description: section.description,
              display_order: sectionIndex,
            },
            { transaction }
          );

          if (section.items && Array.isArray(section.items)) {
            const items = [
              ...section.items,
              {
                name: `I don't want ${section.name}`,
                price: 0,
                is_default: false,
                is_none_option: true,
                display_order: section.items.length,
              },
            ];

            for (const [itemIndex, item] of items.entries()) {
              if (!item.name || typeof item.price !== "number") {
                throw new Error(
                  "Item name and price are required for all items"
                );
              }

              await PackageItem.create(
                {
                  item_id: IdGenerator.generateId("ITEM", []),
                  section_id: sectionId,
                  name: item.name,
                  description: item.description || null,
                  price: item.price,
                  is_default: item.is_default || false,
                  is_none_option: item.is_none_option || false,
                  display_order: itemIndex,
                },
                { transaction }
              );
            }
          }
        }
      }

      await transaction.commit();

      // Fetch created package
      const createdPackage = await Package.findByPk(newPackageID, {
        include: [
          {
            model: ServiceType,
            attributes: ["name", "description"],
          },
          {
            model: PackageSection,
            include: [PackageItem],
            order: [["display_order", "ASC"]],
          },
        ],
      });

      const defaultPrice = createdPackage.PackageSections.reduce(
        (total, section) => {
          const defaultItems = section.PackageItems.filter(
            (item) => item.is_default
          );
          return (
            total +
            defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
          );
        },
        0
      );

      res.status(201).json({
        status: "success",
        data: {
          ...createdPackage.toJSON(),
          default_price: defaultPrice,
        },
        message: "Package created successfully",
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

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Invalid data format",
          errors: error.errors.map((err) => err.message),
        });
      }
      next(error);
    }
  }

  static async updatePackage(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      let {
        name,
        description,
        type_id,
        duration_hours,
        duration_minutes,
        grace_period,
        penalty_percentage,
        advance_percentage,
        sections,
        bufferTime,
        commitionRate,
      } = req.body;

      if (typeof bufferTime === "string") {
        try {
          bufferTime = JSON.parse(bufferTime);
        } catch (e) {
          bufferTime = [];
        }
      }

      if (typeof commitionRate === "string") {
        try {
          commitionRate = JSON.parse(commitionRate);
        } catch (e) {
          commitionRate = [];
        }
      }

      console.log("Parsed bufferTime:", bufferTime);
      console.log("Parsed commitionRate:", commitionRate);

      // Validate package existence
      const pkg = await Package.findByPk(id);
      if (!pkg) {
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
          message: `Package with ID ${id} not found`,
        });
      }

      // Handle file upload
      if (req.file) {
        const iconUrl = `/uploads/files/${req.file.filename}`;

        // Delete old file if exists
        if (pkg.icon_url) {
          const relativePath = pkg.icon_url.startsWith("/")
            ? pkg.icon_url.slice(1)
            : pkg.icon_url;

          const oldFilePath = path.join(__dirname, "..", relativePath);

          if (fs.existsSync(oldFilePath)) {
            fs.unlink(oldFilePath, (err) => {
              if (err) console.error("Error deleting old file:", err);
            });
          }
        }

        await pkg.update({ icon_url: iconUrl }, { transaction });
      }

      if (bufferTime?.length >= 0) {
        // Delete existing buffer time
        await CitySpecificBuffertime.destroy(
          {
            where: {
              item_id: id,
              item_type: "package",
            },
          },
          { transaction }
        );

        // Create new buffer time entries if provided
        if (bufferTime.length > 0) {
          await Promise.all(
            bufferTime.map(async (time) => {
              return CitySpecificBuffertime.create(
                {
                  item_id: id,
                  item_type: "package",
                  city_id: time.city_id,
                  buffer_hours: Math.floor(time.buffer_hours),
                  buffer_minutes: Math.floor(time.buffer_minutes),
                },
                { transaction }
              );
            })
          );
        }
      }

      //Handle Commition rates updates
      if (commitionRate?.length >= 0) {
        // Delete existing pricing
        await ServiceCommission.destroy({
          where: {
            item_id: id,
            item_type: "package",
          },
        });

        // Create new pricing entries if provided
        if (commitionRate.length > 0) {
          await Promise.all(
            commitionRate.map(async (commition) => {
              return ServiceCommission.create({
                city_id: commition.city_id,
                item_id: id,
                item_type: "package",
                commission_rate: commition.rate,
              });
            })
          );
        }
      }
      // Update basic package info
      await pkg.update(
        {
          name,
          description,
          type_id,
          duration_hours,
          duration_minutes,
        },
        { transaction }
      );

      // Update sections and items
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          if (!section.name) {
            throw new Error("Section name is required");
          }

          let updatedSection;
          if (section.section_id) {
            updatedSection = await PackageSection.findOne({
              where: {
                section_id: section.section_id,
                package_id: id,
              },
            });

            if (updatedSection) {
              await updatedSection.update(
                {
                  name: section.name,
                  description: section.description,
                  display_order: section.display_order,
                },
                { transaction }
              );
            }
          }

          if (!updatedSection) {
            const newSectionID = IdGenerator.generateId("SECT", []);
            updatedSection = await PackageSection.create(
              {
                section_id: newSectionID,
                package_id: id,
                name: section.name,
                description: section.description,
                display_order: section.display_order,
              },
              { transaction }
            );
          }

          if (section.items && Array.isArray(section.items)) {
            for (const item of section.items) {
              if (!item.name || typeof item.price !== "number") {
                throw new Error(
                  "Item name and price are required for all items"
                );
              }

              if (item.item_id) {
                const existingItem = await PackageItem.findOne({
                  where: {
                    item_id: item.item_id,
                    section_id: updatedSection.section_id,
                  },
                });

                if (existingItem) {
                  await existingItem.update(
                    {
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      is_default: item.is_default,
                      is_none_option: item.is_none_option,
                      display_order: item.display_order,
                    },
                    { transaction }
                  );
                  continue;
                }
              }

              await PackageItem.create(
                {
                  item_id: IdGenerator.generateId("ITEM", []),
                  section_id: updatedSection.section_id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  is_default: item.is_default || false,
                  is_none_option: item.is_none_option || false,
                  display_order: item.display_order,
                },
                { transaction }
              );
            }
          }
        }
      }

      await transaction.commit();

      // Fetch updated package
      const updatedPackage = await Package.findByPk(id, {
        include: [
          {
            model: ServiceType,
            attributes: ["name", "description"],
          },
          {
            model: PackageSection,
            include: [PackageItem],
            order: [["display_order", "ASC"]],
          },
        ],
      });

      const defaultPrice = updatedPackage.PackageSections.reduce(
        (total, section) => {
          const defaultItems = section.PackageItems.filter(
            (item) => item.is_default
          );
          return (
            total +
            defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
          );
        },
        0
      );

      res.status(200).json({
        status: "success",
        data: {
          ...updatedPackage.toJSON(),
          default_price: defaultPrice,
        },
        message: "Package updated successfully",
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

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Invalid data format",
          errors: error.errors.map((err) => err.message),
        });
      }
      next(error);
    }
  }

  static async deletePackage(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      const pkg = await Package.findByPk(id);
      if (!pkg) {
        return res.status(404).json({
          status: "error",
          message: `Package with ID ${id} not found`,
        });
      }

      // Delete the associated image file if it exists
      if (pkg.icon_url) {
        const relativePath = pkg.icon_url.startsWith("/")
          ? pkg.icon_url.slice(1)
          : pkg.icon_url;

        const filePath = path.join(__dirname, "..", relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }
      }

      await pkg.destroy({ transaction });
      await transaction.commit();

      res.status(200).json({
        status: "success",
        message: "Package and associated data deleted successfully",
      });
    } catch (error) {
      await transaction.rollback();

      if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          status: "error",
          message: "Cannot delete package as it is referenced by other records",
        });
      }
      next(error);
    }
  }

  static async getPackagesByType(req, res, next) {
    try {
      const { typeId } = req.params;

      const serviceType = await ServiceType.findByPk(typeId);
      if (!serviceType) {
        return res.status(404).json({
          status: "error",
          message: `Service type with ID ${typeId} not found`,
        });
      }

      const packages = await Package.findAll({
        where: { type_id: typeId },
        include: [
          {
            model: ServiceType,
            attributes: ["name", "description"],
          },
          {
            model: CitySpecificBuffertime,
          },
          {
            model: ServiceCommission,
          },
          {
            model: PackageSection,
            include: [PackageItem],
          },
        ],
        order: [
          ["display_order", "ASC"],
          [PackageSection, PackageItem, "display_order", "ASC"],
        ],
      });

      const packagesWithPrice = packages.map((pkg) => {
        const defaultPrice = pkg.PackageSections.reduce((total, section) => {
          const defaultItems = section.PackageItems.filter(
            (item) => item.is_default
          );
          return (
            total +
            defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
          );
        }, 0);

        return {
          ...pkg.toJSON(),
          default_price: defaultPrice,
        };
      });

      res.status(200).json({
        status: "success",
        data: packagesWithPrice,
        message: packages.length
          ? "Packages retrieved successfully"
          : "No packages found for this service type",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Invalid service type ID format",
        });
      }
      next(error);
    }
  }

  static async getPackageById(req, res, next) {
    try {
      const { id } = req.params;

      const pkg = await Package.findByPk(id, {
        include: [
          {
            model: ServiceType,
            attributes: ["name", "description"],
          },
          {
            model: PackageSection,
            include: [PackageItem],
            order: [["display_order", "ASC"]],
          },
        ],
        order: [
          [PackageSection, "display_order", "ASC"],
          [PackageSection, PackageItem, "display_order", "ASC"],
        ],
      });

      if (!pkg) {
        return res.status(404).json({
          status: "error",
          message: `Package with ID ${id} not found`,
        });
      }

      const defaultPrice = pkg.PackageSections.reduce((total, section) => {
        const defaultItems = section.PackageItems.filter(
          (item) => item.is_default
        );
        return (
          total +
          defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
        );
      }, 0);

      res.status(200).json({
        status: "success",
        data: {
          ...pkg.toJSON(),
          default_price: defaultPrice,
        },
        message: "Package retrieved successfully",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Invalid package ID format",
        });
      }
      next(error);
    }
  }

  static calculateDefaultPrice(sections) {
    return sections.reduce((total, section) => {
      const defaultItems = section.PackageItems.filter(
        (item) => item.is_default
      );
      return (
        total + defaultItems.reduce((sum, item) => sum + Number(item.price), 0)
      );
    }, 0);
  }
}

module.exports = PackageController;
