const { v4: uuidv4 } = require("uuid");
const { BookingPayment, Booking } = require("../models");

const transactions = {};

class PaymentController {
  static async proceedPayment(req, res, next) {
    const { amount, bookingId, cardNumber, expiry, cvv } = req.body;

    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (!amount || !bookingId || !cardNumber || !expiry || !cvv) {
        return res
          .status(400)
          .json({ error: "Missing required payment details" });
      }

      const isSuccess = Math.random() > 0.2; // 80% success rate
      const transactionId = uuidv4();

      const transaction = {
        id: transactionId,
        amount,
        status: isSuccess ? "success" : "failed",
        timestamp: new Date(),
      };

      const payment = await BookingPayment.findOne({
        where: { booking_id: bookingId },
      });

      const booking = await Booking.findOne({
        where: { booking_id: bookingId },
      });

      if (isSuccess) {
        await payment.update({
          transaction_id: transactionId,
          payment_status: "completed",
        });
        await booking.update({
          status: "confirmed",
        });
      } else {
        await payment.update({
          payment_status: "failed",
        });
      }

      transactions[transactionId] = transaction;

      res.status(200).json(transaction);
    } catch (error) {
      console.error("Payment Error:", error);
      next(error);
    }
  }
}
module.exports = PaymentController;
