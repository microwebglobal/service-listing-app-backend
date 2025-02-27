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
  ServiceProviderEmployee,
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
            model: ServiceProviderEmployee,
            as: "employee",
            include: [
              {
                model: User,
                attributes: ["name", "email", "mobile"],
              },
            ],
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

  static async bookingSendOTP(req, res, next) {
    try {
      console.log(req.body);
      const { mobile, bookingId } = req.body;

      if (!mobile) {
        throw createError(400, "Mobile number is required");
      }

      if (!bookingId) {
        throw createError(400, "Booking Id is required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      const otp = "123456";

      console.log(`OTP for ${mobile}:`, otp);

      await booking.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
      });

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async bookingVerifyOTP(req, res, next) {
    try {
      const { otp, bookingId } = req.body;

      if (!bookingId || !otp) {
        throw createError(400, "Booking Id and OTP are required");
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (!booking) {
        throw createError(404, "Booking not found");
      }

      if (!booking.otp || booking.otp !== otp) {
        throw createError(400, "Invalid OTP");
      }

      if (new Date() > new Date(booking.otp_expires)) {
        throw createError(400, "OTP has expired");
      }

      await booking.update({
        otp: null,
        otp_expires: null,
        status: "in_progress",
      });

      res.json({
        success: true,
        message: "OTP verified successfully And Booking In Progress",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProviderBookingController;
