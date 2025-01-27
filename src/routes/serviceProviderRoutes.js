const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware.js");
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");
const ServiceProviderEnquiryController = require("../controllers/ServiceProviderEnquiryController");
const ServiceProviderController = require("../controllers/ServiceProviderController");
const ServiceProviderEmployeeController = require("../controllers/ServiceProviderEmployeeController");
const UserController = require("../controllers/userController.js");

//const { authenticate, authorize } = require('../middleware/auth');

// Enquiry routes
router.post("/enquiry", ServiceProviderEnquiryController.createEnquiry);
router.get(
  "/enquiry",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderEnquiryController.getAllEnquiries
);
router.get("/enquiry/:id", ServiceProviderEnquiryController.getEnquirieById);
router.put(
  "/enquiry/:id/approve",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderEnquiryController.approveEnquiry
);

// Provider routes
router.get(
  "/providers",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderController.getAllProviders
);
router.get("/provider/user/:id", ServiceProviderController.getProviderByUserId);
router.post(
  "/provider/register",
  upload.any(),
  ServiceProviderController.registerProvider
);
router.put(
  "/providers/:id/status",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderController.updateProviderStatus
);
router.put(
  "/providers/:id/categories",
  ServiceProviderController.updateServiceCategories
);

router.put("/provider/:id", ServiceProviderController.updateProviderStatus);
router.put(
  "/provider/update/:id",
  ServiceProviderController.updateProviderProfile
);
// Employee routes
router.get(
  "/providers/:providerId/employees",
  ServiceProviderEmployeeController.getAllEmployees
);
router.post(
  "/providers/:providerId/employees",
  ServiceProviderEmployeeController.addEmployee
);

//provider user password routes
router.put("/provider/password/:id", UserController.setUserPassword);

module.exports = router;
