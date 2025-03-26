const cron = require("node-cron");
const moment = require("moment-timezone");
const { AssignmentHistory, Booking, sequelize } = require("../models");
const BookingController = require("../controllers/BookingController");
const { Op } = require("sequelize");

let isJobActive = false; // Flag to control whether the cron job is active or paused

let reassignmentCronJob = cron.schedule("*/10 * * * *", async () => {
  if (!isJobActive) {
    console.log("Cron job is paused, skipping execution.");
    return; // Skip the cron job if it's paused
  }

  // Your original cron job logic
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

  // console.log("Unaccepted bookings:", unacceptedBookings);

  for (let assignment of unacceptedBookings) {
    const transaction = await sequelize.transaction();
    try {
      // console.log(`Reassigning provider for booking ${assignment.booking_id}...`);

      await assignment.update({ status: "timeout" }, { transaction });

      const newAssignedProvider = await BookingController.assignServiceProvider(
        assignment.booking_id,
        assignment?.Booking?.city_id,
        transaction
      );

      if (newAssignedProvider) {
        console.log(`New provider assigned:`);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
  }
});

console.log("Reassignment cron job started.");

// Function to pause the cron job
function stopCronJob() {
  isJobActive = false;
  console.log("Cron job paused.");
}

// Function to resume the cron job
function resumeCronJob() {
  isJobActive = true;
  console.log("Cron job resumed.");
}

// Example of stopping and resuming the cron job after a delay (for testing purposes)
setTimeout(stopCronJob, 30000); // Stop after 30 seconds
setTimeout(resumeCronJob, 60000); // Resume after 60 seconds
