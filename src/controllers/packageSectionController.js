const {
  PackageSection,
  PackageItem,
  CitySpecificPricing,
  SpecialPricing,
} = require("../models");
const IdGenerator = require("../utils/helper");

class PackageSectionController {
  static async getSectionsByPackage(req, res, next) {
    try {
      const sections = await PackageSection.findAll({
        where: { package_id: req.params.packageId },
        include: [
          {
            model: PackageItem,
            order: [["display_order", "ASC"]],
            include: [
              { model: CitySpecificPricing },
              { model: SpecialPricing },
            ],
          },
        ],
        order: [["display_order", "ASC"]],
      });

      res.status(200).json(sections);
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req, res, next) {
    try {
      const { package_id, name, description, display_order, items } = req.body;

      console.log("File:", req.file);
      console.log("Body:", req.body);

      const iconUrl = `/uploads/files/${req?.file?.filename}`;
      // Generate new section ID
      const existingSections = await PackageSection.findAll({
        attributes: ["section_id"],
      });
      const existingIds = existingSections.map((section) => section.section_id);
      const newSectionID = IdGenerator.generateId("SECT", existingIds);

      const section = await PackageSection.create({
        section_id: newSectionID,
        package_id,
        name,
        description,
        display_order,
        icon_url: iconUrl,
      });

      // Create items if provided
      if (items && Array.isArray(items)) {
        const itemController = require("./packageItemController");
        for (const item of items) {
          await itemController.createItem({
            ...item,
            section_id: newSectionID,
          });
        }
      }

      const createdSection = await PackageSection.findByPk(newSectionID, {
        include: [PackageItem],
      });

      res.status(201).json(createdSection);
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const { section_id, ...updateData } = req.body;
      const [updated] = await PackageSection.update(updateData, {
        where: { section_id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ error: "Section not found" });
      }

      const updatedSection = await PackageSection.findByPk(req.params.id, {
        include: [PackageItem],
      });
      res.status(200).json(updatedSection);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      const deleted = await PackageSection.destroy({
        where: { section_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.status(200).json({ message: "Section deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PackageSectionController;
