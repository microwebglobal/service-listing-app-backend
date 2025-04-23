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
  AssignmentHistory,
  ServiceCategory,
  sequelize,
} = require("../models");
const { Op, where } = require("sequelize");
const createError = require("http-errors");
const { differenceInMinutes } = require("date-fns");
const NotificationService = require("../services/NotificationService");

class CustomerBookingController {
  static async customerCancellBooking(req, res, next) {
    const bookingId = req.params.id;

    try {
      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
        include: [
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
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const now = new Date();
      const createdDate = new Date(booking.created_at);
      const bookingStartDate = new Date(
        `${booking.booking_date}T${booking.start_time}`
      );

      let minGracePeriod = 0;
      let penaltyAmount = 0;
      let penaltyPercentage = 0;

      for (const item of booking.BookingItems) {
        if (item.item_type === "package_item") {
          const packageSection = await PackageSection.findOne({
            where: {
              section_id: item?.packageItem?.section_id,
            },
          });

          const bookedPackage = await Package.findOne({
            where: {
              package_id: packageSection?.package_id,
            },
          });

          minGracePeriod = parseFloat(bookedPackage?.grace_period || 0);
          penaltyPercentage = parseFloat(
            bookedPackage?.penalty_percentage || 0
          );
        } else {
          minGracePeriod = Math.min(
            ...booking.BookingItems.map((i) =>
              parseFloat(i.serviceItem?.grace_period || 0)
            )
          );

          penaltyPercentage = parseFloat(
            item.serviceItem?.penalty_percentage || 0
          );
        }

        if (minGracePeriod > 0) {
          const totalMinutes = differenceInMinutes(
            bookingStartDate,
            createdDate
          );

          const graceTimeInMinutes = Math.floor(
            (totalMinutes / 100) * minGracePeriod
          );

          const graceExpiryTime = new Date(
            createdDate.getTime() + graceTimeInMinutes * 60 * 1000
          );

          console.log(`Total Minutes: ${totalMinutes}`);
          console.log(`Min Grace Period: ${minGracePeriod}%`);
          console.log(`Grace Time (Minutes): ${graceTimeInMinutes}`);
          console.log(`Grace Expiry Time: ${graceExpiryTime}`);

          if (now > graceExpiryTime) {
            const totalPrice = parseFloat(item.total_price);
            penaltyAmount += (penaltyPercentage / 100) * totalPrice;
          }
        }
      }

      console.log(`Penalty Amount: ₹${penaltyAmount.toFixed(2)}`);

      return res.json({
        penalty:
          penaltyAmount > 0
            ? `₹${penaltyAmount.toFixed(2)} charged`
            : "No penalty applied",
      });
    } catch (error) {
      next(error);
    }
  }

  static async customerConfirmCancellBooking(req, res, next) {
    const transaction = await sequelize.transaction();
    const bookingId = req.params.id;
    let { penalty } = req.body;
    const now = new Date();

    console.log(req.body);

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const booking = await Booking.findOne({
        where: { booking_id: bookingId, user_id: req.user.id },
        transaction,
      });

      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ message: "Booking not found" });
      }

      const penaltyAmount = parseFloat(penalty.replace(/[^0-9.]/g, "")) || 0;

      const roundedPenaltyAmount = -penaltyAmount.toFixed(2);

      const user = await User.findOne({
        where: { u_id: req.user.id },
        transaction,
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = user.acc_balance || 0;

      console.log(currentBalance);

      // Update the account balance by adding the penalty amount
      const updatedBalance =
        parseFloat(currentBalance) + parseFloat(roundedPenaltyAmount);
      console.log(updatedBalance);

      await User.update(
        { acc_balance: updatedBalance },
        { where: { u_id: req.user.id }, transaction }
      );

      // Update booking status
      await booking.update(
        {
          status: "cancelled",
          cancelled_by: "customer",
          cancellation_time: now,
          cancellation_reason: "cancelled by customer",
          penalty_amount: penaltyAmount,
          penalty_status: "pending",
        },
        { transaction }
      );

      await AssignmentHistory.update(
        {
          status: "cancelled",
        },
        {
          where: { booking_id: bookingId },
          transaction,
        }
      );

      //notification for customer
      await NotificationService.createNotification({
        userId: booking.user_id,
        type: "booking",
        title: "Booking Cancelled",
        message: `Your booking #${bookingId} has been cancelled sucessfully.`,
      });

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
}

module.exports = CustomerBookingController;
