const express = require("express");
const router = express.Router();
const ServiceProviderEnquiryController = require("../controllers/ServiceProviderEnquiryController");
const ServiceProviderController = require("../controllers/ServiceProviderController");
const ServiceProviderEmployeeController = require("../controllers/ServiceProviderEmployeeController");
//const { authenticate, authorize } = require('../middleware/auth');

// Enquiry routes
router.post("/enquiry", ServiceProviderEnquiryController.createEnquiry);
router.get("/enquiry", ServiceProviderEnquiryController.getAllEnquiries);
router.get("/enquiry/:id", ServiceProviderEnquiryController.getEnquirieById);
router.put(
  "/enquiry/:id/approve",
  ServiceProviderEnquiryController.approveEnquiry
);

// Provider routes
router.get("/providers", ServiceProviderController.getAllProviders);
router.post("/provider/register", ServiceProviderController.registerProvider);
router.put(
  "/providers/:id/status",
  ServiceProviderController.updateProviderStatus
);
router.put(
  "/providers/:id/categories",
  ServiceProviderController.updateServiceCategories
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

module.exports = router;
