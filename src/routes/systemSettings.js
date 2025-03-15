const express = require("express");
const router = express.Router();
const SystemSettingsController = require("../controllers/SystemSettingsController");

router.get("/settings", SystemSettingsController.getAllSettings);
router.put("/settings/:key", SystemSettingsController.updateSetting);

module.exports = router;
