const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const AdminPayoutsController = require("../controllers/AdminPayoutsController.js");

router.get("/logs/:date", AdminPayoutsController.getAllPaymentLogsByDate);

router.get(
  "/logs/genarate/:date",
  AdminPayoutsController.generateDailyPayoutSummary
);

router.put("/logs/settle/:logId", AdminPayoutsController.settleDailyPayout);

module.exports = router;
