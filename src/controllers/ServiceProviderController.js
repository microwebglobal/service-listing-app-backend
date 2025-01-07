const {
  ServiceProvider,
  User,
  City,
  ServiceCategory,
  ProviderServiceCategory,
  ProviderServiceCity,
  ServiceProviderEnquiry,
} = require("../models");

class ServiceProviderController {
  static async getAllProviders(req, res, next) {
    try {
      const providers = await ServiceProvider.findAll({
        include: [{ model: User }, { model: ServiceCategory }, { model: City }],
        order: [["provider_id", "DESC"]],
      });
      res.status(200).json(providers);
    } catch (error) {
      next(error);
    }
  }

  static async registerProvider(req, res, next) {
    try {
      const {
        enquiry_id,
        business_registration_number,
        service_radius,
        availability_type,
        availability_hours,
        specializations,
        qualification,
        profile_bio,
        languages_spoken,
        social_media_links,
        payment_method,
        payment_details,
        categories,
        cities,
      } = req.body;

      // Fetch the enquiry
      const enquiry = await ServiceProviderEnquiry.findByPk(enquiry_id);
      if (!enquiry) {
        return res.status(404).json({ error: "Invalid registration link" });
      }

      // Create provider
      const provider = await ServiceProvider.create({
        user_id: enquiry.user_id,
        business_type: enquiry.business_type,
        business_name: enquiry.business_name,
        business_registration_number,
        primary_location: enquiry.primary_location,
        service_radius,
        availability_type,
        availability_hours,
        years_experience: enquiry.years_experience,
        specializations,
        qualification,
        profile_bio,
        languages_spoken,
        social_media_links,
        payment_method,
        payment_details,
      });

      // Add categories with metadata
      for (const category of categories) {
        await ProviderServiceCategory.create({
          provider_id: provider.provider_id,
          category_id: category.id,
          experience_years: category.experience_years,
          is_primary: category.is_primary,
        });
      }

      // Add cities with metadata
      for (const city of cities) {
        await ProviderServiceCity.create({
          provider_id: provider.provider_id,
          city_id: city.id,
          service_radius: city.service_radius,
          is_primary: city.is_primary,
        });
      }

      res.status(201).json({
        message: "Provider registered successfully",
        provider_id: provider.provider_id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProviderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const [updated] = await ServiceProvider.update(
        { status },
        { where: { provider_id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async updateServiceCategories(req, res, next) {
    try {
      const { categories } = req.body;
      const provider = await ServiceProvider.findByPk(req.params.id);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Delete existing categories
      await ProviderServiceCategory.destroy({
        where: { provider_id: provider.provider_id },
      });

      // Add new categories
      for (const category of categories) {
        await ProviderServiceCategory.create({
          provider_id: provider.provider_id,
          category_id: category.id,
          experience_years: category.experience_years,
          is_primary: category.is_primary,
        });
      }

      res
        .status(200)
        .json({ message: "Service categories updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceProviderController;
