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
  ServiceCommission,
  DailyPayoutLogs,
  sequelize,
} = require("../models");
const { Op, where } = require("sequelize");
const createError = require("http-errors");

class AdminPayoutsController {
  static async getAllPaymentLogsByDate(req, res, next) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const parsedDate = new Date(date);

      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const paymentLogs = await DailyPayoutLogs.findAll({
        where: {
          date: {
            [Op.eq]: parsedDate.toISOString().split("T")[0], // Converts date to YYYY-MM-DD format
          },
        },
      });

      if (paymentLogs.length === 0) {
        return res.json({ message: "No payment logs found for this date" });
      }

      return res.status(200).json({ paymentLogs });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  static async generateDailyPayoutSummary(req, res, next) {
    try {
      const { date } = req.params;

      // Step 1: Fetch all provider IDs from the ServiceProvider table
      const providers = await ServiceProvider.findAll({
        attributes: ["provider_id"], // Fetching only the provider IDs
      });

      if (!providers || providers.length === 0) {
        return res.status(404).json({ message: "No providers found." });
      }

      // Deleting existing logs for today
      await DailyPayoutLogs.destroy({
        where: {
          date: date,
        },
      });

      // Step 2: Iterate over all providers and calculate the total payout for each
      const payouts = [];

      for (const provider of providers) {
        const providerId = provider.provider_id;

        console.log("Processing Provider ID:", providerId);

        // Fetch completed bookings for the current provider and date
        const bookings = await Booking.findAll({
          where: {
            provider_id: providerId,
            status: "completed",
            booking_date: date,
          },
          include: [
            {
              model: BookingItem,
              include: [
                {
                  model: ServiceItem,
                  include: [ServiceCommission],
                  as: "serviceItem",
                },
              ],
            },
          ],
        });

        if (!bookings || bookings.length === 0) {
          console.log(
            `No bookings found for provider ID ${providerId} on ${date}`
          );
        }

        let totalPayout = 0;

        // Loop through each booking and each booking item to calculate the total payout
        bookings.forEach((booking) => {
          console.log("Booking ID:", booking.booking_id); // Log booking ID for debugging

          booking.BookingItems.forEach((bookingItem) => {
            console.log("Booking Item ID:", bookingItem.id); // Log booking item ID
            const serviceCommission =
              bookingItem.serviceItem.ServiceCommissions[0];

            if (serviceCommission) {
              console.log(
                "Service Commission Rate:",
                serviceCommission.commission_rate
              );

              // Calculate the payout for each BookingItem
              const itemPayout =
                parseFloat(bookingItem.total_price) * (95 / 100);
              console.log(
                `Item Payout for Booking Item ID ${bookingItem.id}:`,
                itemPayout
              );

              totalPayout += itemPayout;
            }
          });
        });

        console.log(`Total Payout for Provider ID ${providerId}:`, totalPayout);

        // Step 3: Store the daily payout log for this provider
        await DailyPayoutLogs.create({
          provider_id: providerId,
          date: date,
          payout_status: "pending",
          payout_amount: totalPayout,
        });

        // Add the result to the payouts array
        payouts.push({
          providerId,
          date,
          totalPayout,
        });
      }

      console.log("Payout Array:", payouts);

      // If no payout was generated, return an appropriate message
      if (payouts.length === 0) {
        return res.status(404).json({
          message: "No payouts generated for any provider on the given date.",
        });
      }

      // Step 4: Return the generated payouts
      return res.status(200).json({
        message: "Daily payout summaries have been generated successfully.",
        payouts,
      });
    } catch (error) {
      next(error); // Passing errors to the next middleware
    }
  }
}

module.exports = AdminPayoutsController;
