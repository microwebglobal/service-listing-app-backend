// controllers/serviceProviderProfileController.js

const { ServiceProviderProfile } = require('../models');

class ServiceProviderProfileController {
  // Fetch all service providers
  static async getAllProviders(req, res, next) {
    try {
      const providers = await ServiceProviderProfile.findAll({
        order: [['sp_id', 'DESC']],
      });
      res.status(200).json(providers);
    } catch (error) {
        next(error);
    }
  }

  // Fetch a single profile by user ID
  static async getProfileByUserId(req, res, next) {
    const { u_id } = req.params;
    try {
      const profile = await ServiceProviderProfile.findOne({ where: { u_id } });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
  }

  // Create a new service provider profile
  static async createProvider(req, res, next) {
    console.log(req.body);
    try {
      const provider = await ServiceProviderProfile.create(req.body);
      res.status(201).json(provider);
    } catch (error) {
        next(error);
    }
  }

  // Update a service provider profile
  static async updateProvider(req, res, next) {
    const { id } = req.params;
    try {
      const [updated] = await ServiceProviderProfile.update(req.body, {
        where: { sp_id: id },
      });
      if (!updated) return res.status(404).json({ message: 'Provider not found' });
      const updatedProfile = await ServiceProviderProfile.findByPk(id);
      res.status(200).json(updatedProfile);
    } catch (error) {
        next(error);
    }
  }

  // Delete a service provider profile
  static async deleteProvider(req, res, next) {
    const { id } = req.params;
    try {
      const deleted = await ServiceProviderProfile.destroy({
        where: { sp_id: id },
      });
      if (!deleted) return res.status(404).json({ message: 'Provider not found' });
      res.status(200).json({ message: 'Provider deleted successfully' });
    } catch (error) {
        next(error);
    }
  }
}

module.exports = ServiceProviderProfileController;
