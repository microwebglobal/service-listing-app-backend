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
  ProviderServiceCategory,
  ServiceCategory,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const createError = require("http-errors");
const { differenceInDays } = require("date-fns");

class CustomerBookingController {
  static async customerCancellBooking(req, res, next) {
    const bookingId = req.params.id;

    try {
      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        include: [{ model: BookingItem, include: [ServiceItem] }],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const today = new Date();
      const createdDate = new Date(booking.created_at);
      const bookingStartDate = new Date(booking.booking_date);

      // Find the minimum grace period among all service items
      let minGracePeriod = Math.min(
        ...booking.BookingItems.map(
          (item) => parseFloat(item.serviceItem.grace_period) || 0
        )
      );

      let penaltyAmount = 0;

      if (minGracePeriod > 0) {
        // Calculate grace time and grace expiry date
        const totalDays = differenceInDays(bookingStartDate, createdDate);
        const graceTime = Math.floor((totalDays / 100) * minGracePeriod);
        const graceExpiryDate = new Date(createdDate);
        graceExpiryDate.setDate(graceExpiryDate.getDate() + graceTime);

        // If today is past the grace expiry date, apply penalty
        if (today > graceExpiryDate) {
          booking.BookingItems.forEach((item) => {
            const penaltyPercentage =
              parseFloat(item.serviceItem.penalty_percentage) || 0;
            const totalPrice = parseFloat(item.total_price);
            penaltyAmount += (penaltyPercentage / 100) * totalPrice;
          });
        }
      }

      // Update booking status
      await booking.update({
        status: "cancelled",
        cancellation_time: today,
      });

      return res.json({
        message: "Booking cancelled successfully",
        penalty:
          penaltyAmount > 0
            ? `₹${penaltyAmount.toFixed(2)} charged`
            : "No penalty applied",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerBookingController;
