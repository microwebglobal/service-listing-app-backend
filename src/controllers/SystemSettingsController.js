const { SystemSettings } = require("../models");

class SystemSettingsController {
  // Get all settings
  static async getAllSettings(req, res, next) {
    try {
      const settings = await SystemSettings.findAll({
        order: [["setting_id", "DESC"]],
      });
      res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  }

  // Update a setting by key
  static async updateSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const setting = await SystemSettings.findOne({ where: { key } });

      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      await setting.update({ value: JSON.stringify(value) });

      res
        .status(200)
        .json({ message: "Setting updated successfully", setting });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SystemSettingsController;
