const cron = require("node-cron");
const moment = require("moment-timezone");
const { AssignmentHistory, Booking, sequelize } = require("../models");
const BookingController = require("../controllers/BookingController");
const { Op } = require("sequelize");

cron.schedule("* * * * * *", async () => {
  //   console.log("Running provider reassignment check...");

  const currentTimeLocal = moment().tz("Asia/Colombo");

  const tenMinutesAgo = currentTimeLocal
    .clone()
    .subtract(10, "minutes")
    .format("YYYY-MM-DD HH:mm:ss.sSSSZ");

  const tenMinutesAgoDate = moment(
    tenMinutesAgo,
    "YYYY-MM-DD HH:mm:ss.SSSZ"
  ).toDate();

  const unacceptedBookings = await AssignmentHistory.findAll({
    where: {
      status: "pending",
      created_at: {
        [Op.lt]: tenMinutesAgoDate,
      },
    },
    include: Booking,
  });

  //   console.log("Unaccepted bookings:", unacceptedBookings);

  for (let assignment of unacceptedBookings) {
    const transaction = await sequelize.transaction();
    try {
      //   console.log(
      //     `Reassigning provider for booking ${assignment.booking_id}...`
      //   );

      await assignment.update({ status: "timeout" }, { transaction });

      const newAssignedProvider = await BookingController.assignServiceProvider(
        assignment.booking_id,
        assignment?.Booking?.city_id,
        transaction
      );

      //   if (newAssignedProvider) {
      //     console.log(`New provider assigned:`);
      //   } else {
      //     console.log("No available providers for reassignment.");
      //   }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Reassignment failed:", error);
    }
  }
});

console.log("Reassignment cron job started.");
