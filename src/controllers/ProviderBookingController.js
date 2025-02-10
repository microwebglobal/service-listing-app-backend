const {
  Booking,
  Service,
  ServiceType,
  SubCategory,
  Package,
  PackageSection,
  BookingItem,
  BookingPayment,
  ServiceProvider,
  User,
  ServiceItem,
  PackageItem,
  City,
  ProviderServiceCity,
  ServiceCategory,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const createError = require("http-errors");

class ProviderBookingController {
  static async getBookingByProvider(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await Booking.findAll({
        where: { provider_id: id },
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["u_id", "name", "email", "mobile"],
          },
          {
            model: ServiceProvider,
            as: "provider",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
          },
          {
            model: City,
            attributes: ["city_id", "name"],
          },
          {
            model: BookingItem,
            include: [
              {
                model: ServiceItem,
                as: "serviceItem",
                required: false,
              },
              {
                model: PackageItem,
                as: "packageItem",
                required: false,
              },
            ],
          },
          {
            model: BookingPayment,
          },
        ],
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      res.status(200).json(booking);
    } catch (error) {
      console.error("Error in getBookingById:", error);
      next(error);
    }
  }
}

module.exports = ProviderBookingController;
