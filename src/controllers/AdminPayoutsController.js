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

      const providers = await ServiceProvider.findAll({
        attributes: ["provider_id"],
      });

      if (!providers || providers.length === 0) {
        return res.status(404).json({ message: "No providers found." });
      }

      await DailyPayoutLogs.destroy({
        where: {
          date: date,
          payout_status: "pending",
        },
      });

      const payouts = [];

      for (const provider of providers) {
        const providerId = provider.provider_id;

        console.log("Processing Provider ID:", providerId);

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
        let totalCommition = 0;

        for (const booking of bookings) {
          console.log("Booking ID:", booking.booking_id);

          const bookingPayments = await BookingPayment.findAll({
            where: { booking_id: booking.booking_id },
          });

          //   console.log(
          //     "Payments for Booking ID",
          //     booking.booking_id,
          //     ":",
          //     bookingPayments
          //   );

          bookingPayments.forEach((payment) => {
            const advancedAmount = parseFloat(payment.advance_payment);

            console.log("total payments", payment.total_amount);
            const serviceCommission = parseFloat(
              payment?.service_commition || 0
            );

            totalCommition += serviceCommission;

            if (payment.payment_method === "cash") {
              if (advancedAmount > 0) {
                const payout = advancedAmount - serviceCommission;
                totalPayout += payout;
              } else if (advancedAmount === 0) {
                const payout = 0 - serviceCommission;
                totalPayout += payout;
              }
            } else {
              const payout = payment.total_amount - serviceCommission;
              totalPayout += payout;
            }
          });
          console.log(totalPayout);
          console.log("Total Commition", totalCommition);
        }

        // console.log(`Total Payout for Provider ID ${providerId}:`, totalPayout);

        await DailyPayoutLogs.create({
          provider_id: providerId,
          date: date,
          payout_status: "pending",
          payout_amount: totalPayout,
        });

        const user = await User.findOne({
          user_id: provider.user_id,
        });

        const accBalance = parseFloat(user.acc_balance) + totalPayout;

        user.update({
          acc_balance: accBalance,
        });

        payouts.push({
          providerId,
          date,
          totalPayout,
        });
      }

      //   console.log("Payout Array:", payouts);

      if (payouts.length === 0) {
        return res.status(404).json({
          message: "No payouts generated for any provider on the given date.",
        });
      }

      return res.status(200).json({
        message: "Daily payout summaries have been generated successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async settleDailyPayout(req, res, next) {
    try {
      const { logId } = req.params;
      const { amount, providerId } = req.body;

      await DailyPayoutLogs.update(
        { payout_status: "completed" },
        { where: { log_id: logId } }
      );

      const serviceProvider = await ServiceProvider.findOne({
        where: { provider_id: providerId },
        include: [{ model: User }],
      });

      if (!serviceProvider || !serviceProvider.User) {
        return res.status(404).json({ error: "Service provider not found" });
      }

      const accBalance = parseFloat(serviceProvider.User.acc_balance || 0);
      const currentBalance = accBalance - parseFloat(amount);

      await serviceProvider.User.update({ acc_balance: currentBalance });

      return res.status(200).json({ message: "Payout settled successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async adminSettleCustomerAccount(req, res, next) {
    try {
      const userId = req.params.id;
      const { settleAmount } = req.body;

      if (!settleAmount || isNaN(settleAmount) || settleAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const user = await User.findOne({
        where: { u_id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const accBalance = parseFloat(user.acc_balance);

      const remainingBalance = accBalance + parseFloat(settleAmount);

      await user.update({
        acc_balance: remainingBalance,
        balance_updated_at: new Date(),
      });

      return res.status(200).json({
        message: "Balance updated successfully",
        new_balance: remainingBalance,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminPayoutsController;
