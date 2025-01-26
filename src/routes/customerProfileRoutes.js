const express = require("express");
const router = express.Router();
const CustomerProfileController = require("../controllers/customerProfileController");
// const { authenticate, authorize } = require('../middleware/auth'); // Import auth middleware

// Customer profile routes
router.get("/", CustomerProfileController.getAllProfiles);
router.get("/:id", CustomerProfileController.getProfileById);
router.get(
  "/customer-profiles/user/:uId",
  CustomerProfileController.getProfileByUserId
);
router.post("/", CustomerProfileController.createProfile);
router.put("/users/profile/:id", CustomerProfileController.updateProfile);
router.patch(
  "/:id/loyalty-points",
  CustomerProfileController.updateLoyaltyPoints
);
router.patch("/:id/tier-status", CustomerProfileController.updateTierStatus);
router.delete("/:id", CustomerProfileController.deleteProfile);
router.get(
  "/users/send-emailvalidate/:uId",
  CustomerProfileController.sendEmailVarificationLink
);
router.put(
  "/users/validate-email/:id",
  CustomerProfileController.verifyCustomerEmail
);

module.exports = router;
