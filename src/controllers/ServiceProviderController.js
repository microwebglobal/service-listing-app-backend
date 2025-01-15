const {
  ServiceProvider,
  User,
  City,
  ServiceCategory,
  ProviderServiceCategory,
  ProviderServiceCity,
  ServiceProviderEnquiry,
  ServiceProviderEmployee,
} = require("../models");
const { sequelize } = require("../models");

const { generateRegistrationLink } = require("../utils/helpers.js");

class ServiceProviderController {
  static async getAllProviders(req, res, next) {
    try {
      const providers = await ServiceProvider.findAll();
      res.status(200).json(providers);
    } catch (error) {
      next(error);
    }
  }

  static async getProviderById(req, res, next) {
    try {
      const provider = await ServiceProvider.findByPk(req.params.id, {
        include: [{ model: User }, { model: ServiceCategory }, { model: City }],
      });

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.status(200).json(provider);
    } catch (error) {
      next(error);
    }
  }

  static async registerProvider(req, res, next) {
    console.log(req.body);
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
        employees,
        whatsapp_number,
        emergency_contact_name,
        alternate_number,
        reference_number,
        reference_name,
        aadhar_number,
        pan_number,
        certificates_awards,
      } = req.body;

      // Find and validate enquiry
      const enquiry = await ServiceProviderEnquiry.findByPk(enquiry_id);
      if (!enquiry) {
        return res.status(404).json({
          error: "Invalid registration link",
          message: "This registration link is invalid or has expired",
        });
      }

      // Check enquiry status
      if (enquiry.status === "completed") {
        return res.status(409).json({
          error: "Registration already completed",
          message: "This registration has already been completed",
        });
      }

      // Check registration link expiration
      if (
        enquiry.registration_link_expires &&
        new Date() > new Date(enquiry.registration_link_expires)
      ) {
        return res.status(410).json({
          error: "Registration link expired",
          message:
            "This registration link has expired. Please request a new one",
        });
      }

      // Parse JSON data first
      let parsedData = {};
      try {
        parsedData = {
          availabilityHours:
            typeof availability_hours === "string"
              ? JSON.parse(availability_hours)
              : availability_hours,
          socialMediaLinks:
            typeof social_media_links === "string"
              ? JSON.parse(social_media_links)
              : social_media_links,
          paymentDetails:
            typeof payment_details === "string"
              ? JSON.parse(payment_details)
              : payment_details,
          categories:
            typeof categories === "string"
              ? JSON.parse(categories)
              : categories,
          cities: typeof cities === "string" ? JSON.parse(cities) : cities,
          employees:
            typeof employees === "string" ? JSON.parse(employees) : employees,
        };
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        return res.status(400).json({
          error: "Invalid JSON data in request",
          details: parseError.message,
        });
      }

      // Process arrays
      const processedLanguages = Array.isArray(languages_spoken)
        ? languages_spoken
        : languages_spoken
        ? [languages_spoken]
        : [];

      const processedSpecializations = Array.isArray(specializations)
        ? specializations
        : specializations
        ? [specializations]
        : [];

      // Prepare provider data
      const providerData = {
        enquiry_id: enquiry.enquiry_id,
        user_id: enquiry.user_id,
        business_type: enquiry.business_type,
        business_name: enquiry.business_name,
        business_registration_number,
        primary_location: enquiry.primary_location,
        service_radius: Number(service_radius) || 0,
        availability_type: availability_type || "full_time",
        availability_hours: parsedData.availabilityHours,
        years_experience: Number(enquiry.years_experience) || 0,
        specializations: processedSpecializations,
        qualification,
        whatsapp_number,
        emergency_contact_name,
        alternate_number,
        reference_number,
        reference_name,
        aadhar_number,
        pan_number,
        certificates_awards,
        profile_bio,
        languages_spoken: processedLanguages,
        social_media_links: parsedData.socialMediaLinks,
        payment_method: payment_method || "upi",
        payment_details: parsedData.paymentDetails,
        status: "pending_approval",
      };

      // Check for existing provider
      const existingProvider = await ServiceProvider.findOne({
        where: {
          user_id: enquiry.user_id,
          status: "rejected",
        },
      });

      let provider;
      if (existingProvider) {
        // Reset rejection fields and update with new data
        provider = await existingProvider.update({
          ...providerData,
          rejection_reason: null,
          rejection_date: null,
          status: "pending_approval",
        });
      } else {
        // Create new provider
        provider = await ServiceProvider.create(providerData);
      }

      //handle employees
      if (parsedData.employees && Array.isArray(parsedData.employees)) {
        console.log("parsedData: ", parsedData);
        await Promise.all(
          parsedData.employees.map(async (employee) => {
            try {
              const user = await User.create({
                name: employee.name,
                mobile: employee.phone,
                tokenVersion: 1,
                gender: employee.gender,
                account_status: "pending",
                role: "service_provider",
              });

              await ServiceProviderEmployee.create({
                user_id: user.u_id,
                provider_id: provider.provider_id,
                role: employee.designation,
                qualification: employee.qualification,
                years_experience: 5,
                status: "inactive",
              });
            } catch (error) {
              console.error(error);
            }
          })
        );
      }

      // Handle categories
      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        await Promise.all(
          parsedData.categories.map(async (category) => {
            try {
              await ProviderServiceCategory.create({
                provider_id: provider.provider_id,
                category_id: category.id,
                experience_years: Number(category.experience_years) || 0,
                is_primary: Boolean(category.is_primary),
              });
            } catch (categoryError) {
              console.error("Error creating category:", categoryError);
            }
          })
        );
      }

      // Handle cities
      if (parsedData.cities && Array.isArray(parsedData.cities)) {
        await Promise.all(
          parsedData.cities.map(async (city) => {
            try {
              await ProviderServiceCity.create({
                provider_id: provider.provider_id,
                city_id: city.id,
                service_radius: Number(city.service_radius) || 0,
                is_primary: Boolean(city.is_primary),
              });
            } catch (cityError) {
              console.error("Error creating city:", cityError);
            }
          })
        );
      }

      // Handle file uploads
      if (req.files) {
        const fileUpdates = {};
        Object.keys(req.files).forEach((fieldName) => {
          fileUpdates[fieldName] = req.files[fieldName][0].path;
        });

        if (Object.keys(fileUpdates).length > 0) {
          await provider.update(fileUpdates);
        }
      }

      // Update enquiry status
      await ServiceProviderEnquiry.update(
        {
          status: "completed",
          registration_link_expires: new Date(),
          registration_completed_at: new Date(),
        },
        {
          where: { enquiry_id },
        }
      );

      res.status(201).json({
        message: existingProvider
          ? "Provider registration resubmitted successfully"
          : "Provider registered successfully",
        provider_id: provider.provider_id,
      });
    } catch (error) {
      console.error("Provider registration error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        details: error.original?.detail || error.original?.message,
      });

      res.status(500).json({
        error: "Provider registration failed",
        details: error.message,
        type: error.name,
        validation: error.errors?.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }
  }

  static async updateProviderStatus(req, res, next) {
    const transaction = await sequelize.transaction();

    try {
      const { status, rejection_reason } = req.body;
      const providerId = req.params.id;

      // Validate status
      const validStatuses = [
        "pending_approval",
        "active",
        "suspended",
        "inactive",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const provider = await ServiceProvider.findByPk(providerId, {
        include: [
          {
            model: ServiceProviderEnquiry,
            as: "enquiry",
            required: false,
          },
        ],
        transaction,
      });

      if (!provider) {
        await transaction.rollback();
        return res.status(404).json({
          error: "Provider not found",
          message: `No provider found with ID ${providerId}`,
        });
      }

      // If rejecting, validate rejection reason and handle appropriately
      if (status === "rejected") {
        if (!rejection_reason) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Rejection reason required",
            message: "A reason must be provided when rejecting a provider",
          });
        }

        if (provider.enquiry) {
          try {
            const newRegistrationLink = await generateRegistrationLink(
              provider.enquiry
            );

            await provider.enquiry.update(
              {
                status: "rejected",
                registration_link: newRegistrationLink,
                registration_link_expires: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ), // 7 days
              },
              { transaction }
            );

            await provider.update(
              {
                status,
                rejection_reason,
                rejection_date: new Date(),
              },
              { transaction }
            );

            await transaction.commit();
            return res.status(200).json({
              message: "Registration rejected successfully",
              provider_id: providerId,
              new_status: status,
              registration_link: newRegistrationLink,
              rejection_reason,
            });
          } catch (error) {
            await transaction.rollback();
            console.error("Error in rejection process:", error);
            throw error;
          }
        }
      }

      // For non-rejection status updates
      await provider.update(
        {
          status,
          // Clear rejection fields if status is being changed from rejected
          ...(provider.status === "rejected"
            ? {
                rejection_reason: null,
                rejection_date: null,
              }
            : {}),
        },
        { transaction }
      );

      await transaction.commit();
      res.status(200).json({
        message: "Provider status updated successfully",
        provider_id: providerId,
        new_status: status,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Provider status update error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        details: error.original?.detail || error.original?.message,
      });

      // Handle specific error types
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors?.map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
      }

      next(error);
    }
  }

  static async updateServiceCategories(req, res, next) {
    try {
      const { categories } = req.body;
      const providerId = req.params.id;

      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Delete existing categories
      await ProviderServiceCategory.destroy({
        where: { provider_id: providerId },
      });

      // Add new categories
      const categoryPromises = categories.map((category) =>
        ProviderServiceCategory.create({
          provider_id: providerId,
          category_id: category.id,
          experience_years: Number(category.experience_years) || 0,
          is_primary: Boolean(category.is_primary),
        })
      );

      await Promise.all(categoryPromises);

      res.status(200).json({
        message: "Service categories updated successfully",
        provider_id: providerId,
        categories_count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateServiceCities(req, res, next) {
    try {
      const { cities } = req.body;
      const providerId = req.params.id;

      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Delete existing cities
      await ProviderServiceCity.destroy({
        where: { provider_id: providerId },
      });

      // Add new cities
      const cityPromises = cities.map((city) =>
        ProviderServiceCity.create({
          provider_id: providerId,
          city_id: city.id,
          service_radius: Number(city.service_radius) || 0,
          is_primary: Boolean(city.is_primary),
        })
      );

      await Promise.all(cityPromises);

      res.status(200).json({
        message: "Service cities updated successfully",
        provider_id: providerId,
        cities_count: cities.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProviderProfile(req, res, next) {
    try {
      const providerId = req.params.id;
      const updateData = req.body;

      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Handle JSON fields
      const jsonFields = [
        "availability_hours",
        "social_media_links",
        "payment_details",
      ];
      jsonFields.forEach((field) => {
        if (updateData[field] && typeof updateData[field] === "string") {
          try {
            updateData[field] = JSON.parse(updateData[field]);
          } catch (error) {
            console.error(`Error parsing ${field}:`, error);
          }
        }
      });

      // Handle arrays
      if (
        updateData.languages_spoken &&
        !Array.isArray(updateData.languages_spoken)
      ) {
        updateData.languages_spoken = [updateData.languages_spoken];
      }

      if (
        updateData.specializations &&
        !Array.isArray(updateData.specializations)
      ) {
        updateData.specializations = [updateData.specializations];
      }

      // Handle file uploads
      if (req.files) {
        Object.keys(req.files).forEach((fieldName) => {
          updateData[fieldName] = req.files[fieldName][0].path;
        });
      }

      await provider.update(updateData);

      res.status(200).json({
        message: "Provider profile updated successfully",
        provider_id: providerId,
      });
    } catch (error) {
      console.error("Provider update error:", error);
      next(error);
    }
  }
}

module.exports = ServiceProviderController;
