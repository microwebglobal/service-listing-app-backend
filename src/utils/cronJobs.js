const cron = require("node-cron");
const moment = require("moment-timezone");
const { AssignmentHistory, Booking, sequelize } = require("../models");
const BookingController = require("../controllers/BookingController");
const AdminPayoutsController = require("../controllers/AdminPayoutsController");
const { Op } = require("sequelize");

cron.schedule("* * * * * *", async () => {
  const currentTimeLocal = moment().tz("Asia/Colombo");

  const tenMinutesAgo = currentTimeLocal
    .clone()
    .subtract(1, "minutes")
    .format("YYYY-MM-DD HH:mm:ss.sSSSZ");

  const tenMinutesAgoDate = moment(
    tenMinutesAgo,
    "YYYY-MM-DD HH:mm:ss.SSSZ"
  ).toDate();

  const unacceptedBookings = await AssignmentHistory.findAll({
    where: {
      status: "pending",
    },
    include: Booking,
  });

  for (let assignment of unacceptedBookings) {
    const transaction = await sequelize.transaction();
    try {
      const newAttemptNo = (assignment.attempt_no || 0) + 1;

      await assignment.update(
        { status: "timeout", attempt_no: newAttemptNo },
        { transaction }
      );

      if (assignment.attempt_no < 10) {
        const newAssignedProvider =
          await BookingController.assignServiceProvider(
            assignment.booking_id,
            assignment?.Booking?.city_id,
            transaction,
            newAttemptNo
          );
      } else {
        await assignment.update({ status: "cancelled" }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Reassignment failed:", error);
    }
  }
});

cron.schedule("0 18 * * *", async () => {
  try {
    const today = moment().tz("Asia/Colombo").format("YYYY-MM-DD");
    console.log(`Running daily payout summary for ${today}`);

    await AdminPayoutsController.generateDailyPayoutSummary({
      params: { date: today },
    });

    console.log("Daily payout summary completed.");
  } catch (error) {
    console.error("Error in daily payout cron job:", error);
  }
});
