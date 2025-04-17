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
const ProviderBookingController = require("../controllers/ProviderBookingController.js");
const ProviderDocumentController = require("../controllers/ProviderDocumentController.js");

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
router.put(
  "/enquiry/:id/reject",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderEnquiryController.rejectEnquiry
);
router.delete(
  "/enquiry/:id",
  ServiceProviderEnquiryController.deleteEnquiryRecord
);

// Provider routes
router.get(
  "/providers",
  authMiddleware,
  roleCheck("admin"),
  ServiceProviderController.getAllProviders
);
router.get(
  "/provider/token/:token",
  ServiceProviderController.getProviderByToken
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

router.put(
  "/provider/availability/:id",
  ServiceProviderController.updateProviderAvailability
);

router.delete(
  "/provider/:id",
  ServiceProviderController.deleteServiceProviderRecord
);

//provider document routes
router.put(
  "/provider/doc/approve/:document_id",
  ProviderDocumentController.approveProviderDocument
);
router.put(
  "/provider/doc/reject/:document_id",
  ProviderDocumentController.rejectProviderDocument
);

// Employee routes
router.get(
  "/providers/:providerId/employees",
  ServiceProviderEmployeeController.getAllEmployees
);
router.get(
  "/user/employee",
  authMiddleware,
  ServiceProviderEmployeeController.getEmployeeByUserId
);
router.get(
  "/employee/bookings/:id",
  authMiddleware,
  ServiceProviderEmployeeController.getEmployeeBookings
);
router.post(
  "/providers/:providerId/employees",
  ServiceProviderEmployeeController.addEmployee
);
router.put(
  "/providers/:employeeId/employees",
  ServiceProviderEmployeeController.updateEmployee
);
router.delete(
  "/providers/:employeeId/employees",
  ServiceProviderEmployeeController.deleteEmployee
);

//provider user password routes
router.put("/provider/password/:id", UserController.setUserPassword);

//provider booking routes
router.get(
  "/provider/bookings/:id",
  ProviderBookingController.getBookingByProvider
);
router.post(
  "/booking/edit/send-otp",
  ProviderBookingController.bookingEditSendOTP
);
router.post(
  "/booking/edit/verify-otp",
  ProviderBookingController.bookingEditVerifyOTP
);
router.post(
  "/booking/stop/",
  ProviderBookingController.providerStopOngoingBooking
);
router.post(
  "/booking/stop/verify-otp",
  ProviderBookingController.providerStopOngoingBookingVerify
);
router.get(
  "/booking/:id/payment/",
  ProviderBookingController.getOngoingBookingPayment
);
router.get(
  "/booking/:id/payment/employee",
  ProviderBookingController.getOngoingEmployeeBookingPayment
);
router.put(
  "/booking/:id/payment/collect",
  ProviderBookingController.collectOngoingBookingPayment
);
router.get(
  "/booking/:id/payment/history",
  ProviderBookingController.getProviderBookingPaymentHistory
);

module.exports = router;
