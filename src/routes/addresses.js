const express = require("express");
const router = express.Router();
const AddressController = require("../controllers/AddressController");
const {
  authMiddleware,
  roleCheck,
} = require("../middlewares/auth.middleware.js");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// All routes will be prefixed with /users/addresses from the main router
router.get("/addresses", AddressController.getUserAddresses);
router.get("/addresses/:id", AddressController.getAddressById);
router.post("/addresses", AddressController.createAddress);
router.put("/addresses/:id", AddressController.updateAddress);
router.delete("/addresses/:id", AddressController.deleteAddress);
router.patch("/addresses/:id/primary", AddressController.setPrimaryAddress);
router.get(
  "/city/:cityName/addresses",
  AddressController.getUserAdressBelongsToCity
);
module.exports = router;
