const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const AdminPayoutsController = require("../controllers/AdminPayoutsController.js");
const UserController = require("../controllers/userController.js");
const ServiceProviderProfileController = require("../controllers/serviceProviderProfileController.js");

//get all daily genarated payment logs
router.get("/logs/:date", AdminPayoutsController.getAllPaymentLogsByDate);

//genarate daily payout report
router.get(
  "/logs/genarate/:date",
  AdminPayoutsController.generateDailyPayoutSummary
);

//settle daily payout for a provider
router.put("/logs/settle/:logId", AdminPayoutsController.settleDailyPayout);

//get user acc balance
router.get("/acc-balance", authMiddleware, UserController.getUserAccBalance);

//provider settle account balanece
router.put(
  "/acc-balance/settle",
  authMiddleware,
  ServiceProviderProfileController.settleProviderAccPayables
);

//admin settle customer acc balance
router.put(
  "/customer/account/settle/:id",
  authMiddleware,
  AdminPayoutsController.adminSettleCustomerAccount
);

module.exports = router;
