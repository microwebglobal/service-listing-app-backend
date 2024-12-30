const { SpecialPricing, ServiceItem, PackageItem } = require('../models');
const { Op } = require('sequelize');

class SpecialPricingController {
  static async createSpecialPricing(req, res, next) {
    try {
      const { item_id, item_type, city_id, special_price, start_date, end_date } = req.body;

      // Validate item exists
      const ItemModel = item_type === 'service_item' ? ServiceItem : PackageItem;
      const item = await ItemModel.findByPk(item_id);
      if (!item) {
        return res.status(404).json({ error: `${item_type} not found` });
      }

      // Check for overlapping active special pricing
      const existingPricing = await SpecialPricing.findOne({
        where: {
          item_id,
          item_type,
          city_id,
          status: 'active',
          [Op.or]: [
            {
              start_date: { [Op.between]: [start_date, end_date] }
            },
            {
              end_date: { [Op.between]: [start_date, end_date] }
            }
          ]
        }
      });

      if (existingPricing) {
        return res.status(400).json({ error: 'Overlapping special pricing exists for this period' });
      }

      const specialPricing = await SpecialPricing.create({
        item_id,
        item_type,
        city_id,
        special_price,
        start_date,
        end_date,
        status: 'active'
      });

      res.status(201).json(specialPricing);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveSpecialPricing(req, res, next) {
    try {
      const { item_id, item_type, city_id } = req.query;
      const currentDate = new Date();

      const where = {
        status: 'active',
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate }
      };

      if (item_id) where.item_id = item_id;
      if (item_type) where.item_type = item_type;
      if (city_id) where.city_id = city_id;

      const specialPricing = await SpecialPricing.findAll({ where });
      res.status(200).json(specialPricing);
    } catch (error) {
      next(error);
    }
  }

  static async updateSpecialPricing(req, res, next) {
    try {
      const { special_price, start_date, end_date, status } = req.body;
      const [updated] = await SpecialPricing.update(
        { special_price, start_date, end_date, status },
        { where: { id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Special pricing not found' });
      }

      const updatedPricing = await SpecialPricing.findByPk(req.params.id);
      res.status(200).json(updatedPricing);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSpecialPricing(req, res, next) {
    try {
      const deleted = await SpecialPricing.destroy({
        where: { id: req.params.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Special pricing not found' });
      }

      res.status(200).json({ message: 'Special pricing deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SpecialPricingController;