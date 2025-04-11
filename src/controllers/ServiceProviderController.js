const { where } = require("sequelize");
const {
  ServiceProvider,
  User,
  City,
  ServiceCategory,
  SubCategory,
  ProviderServiceCategory,
  ProviderServiceCity,
  ServiceType,
  Service,
  Package,
  ServiceItem,
  PackageItem,
  PackageSection,
  ServiceProviderEnquiry,
  ServiceProviderEmployee,
  ServiceProviderDocument,
} = require("../models");
const { sequelize } = require("../models");
const MailService = require("../utils/mail.js");

const {
  generateRegistrationLink,
  generatePasswordLink,
  extractTokenPayload,
  generateReRgistrationLink,
} = require("../utils/helpers.js");

class ServiceProviderController {
  static async getAllProviders(req, res, next) {
    try {
      const providers = await ServiceProvider.findAll({
        include: [
          { model: User },
          { model: ServiceCategory, as: "serviceCategories" },
          { model: City, as: "serviceCities" },
          { model: ServiceProviderDocument },
          {
            model: ServiceProviderEmployee,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });
      res.status(200).json(providers);
    } catch (error) {
      next(error);
    }
  }

  static async getProviderById(req, res, next) {
    try {
      const provider = await ServiceProvider.findByPk(req.params.id, {
        include: [
          { model: User },
          {
            model: ServiceCategory,
            as: "serviceCategories",
          },
          { model: City, as: "serviceCities" },
          {
            model: ServiceProviderEmployee,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.status(200).json(provider);
    } catch (error) {
      next(error);
    }
  }

  // Get provider by registration token
  static async getProviderByToken(req, res, next) {
    try {
      const { user_id } = extractTokenPayload(req.params.token);
      if (!user_id) {
        return res.status(400).json({ error: "Invalid token" });
      }

      const provider = await ServiceProvider.findOne({
        where: { user_id },
        include: [
          { model: User },
          {
            model: ProviderServiceCategory,
            as: "providerCategories",
            include: {
              model: ServiceCategory,

              include: [{ model: SubCategory }],
            },
          },
          {
            model: ServiceCategory,
            as: "serviceCategories",
            include: [{ model: SubCategory }],
          },
          { model: City, as: "serviceCities" },
          {
            model: ServiceProviderEmployee,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.status(200).json(provider);
    } catch (error) {
      next(error);
    }
  }

  static async getProviderByUserId(req, res, next) {
    try {
      const provider = await ServiceProvider.findOne({
        where: { user_id: req.params.id },
        include: [
          { model: User },
          {
            model: ProviderServiceCategory,
            as: "providerCategories",
            include: {
              model: ServiceCategory,

              include: [{ model: SubCategory }],
            },
          },
          {
            model: ServiceCategory,
            as: "serviceCategories",
            include: [{ model: SubCategory }],
          },
          { model: City, as: "serviceCities" },
          {
            model: ServiceProviderEmployee,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.status(200).json(provider);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  // Register a new service provider or update an existing one
  static async registerProvider(req, res, next) {
    console.log(req.body);
    let t;
    try {
      t = await sequelize.transaction();

      const {
        enquiry_id,
        business_registration_number,
        service_radius,
        exact_address,
        business_start_date,
        tax_id,
        availability_type,
        availability_hours,
        specializations,
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
        nationality,
        reference_number,
        reference_name,
        aadhar_number,
        pan_number,
        certificates_awards,
      } = req.body;

      // Find and validate enquiry
      const enquiry = await ServiceProviderEnquiry.findByPk(enquiry_id, {
        transaction: t,
      });

      if (!enquiry) {
        await t.rollback();
        return res.status(404).json({
          error: "Invalid registration link",
          message: "This registration link is invalid or has expired",
        });
      }

      if (enquiry.status === "completed") {
        await t.rollback();
        return res.status(409).json({
          error: "Registration already completed",
          message: "This registration has already been completed",
        });
      }

      if (
        enquiry.registration_link_expires &&
        new Date() > new Date(enquiry.registration_link_expires)
      ) {
        await t.rollback();
        return res.status(410).json({
          error: "Registration link expired",
          message:
            "This registration link has expired. Please request a new one",
        });
      }

      // Parse JSON data
      let parsedData;
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
        await t.rollback();
        return res.status(400).json({
          error: "Invalid JSON data in request",
          details: parseError.message,
        });
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
          transaction: t,
        }
      );

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
        qualification: certificates_awards,
        exact_address,
        tax_id,
        business_start_date,
        whatsapp_number,
        emergency_contact_name,
        alternate_number: alternate_number === "" ? null : alternate_number,
        nationality,
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
        transaction: t,
      });

      // Create or update provider
      let provider;
      if (existingProvider) {
        provider = await existingProvider.update(
          {
            ...providerData,
            rejection_reason: null,
            rejection_date: null,
            status: "pending_approval",
          },
          { transaction: t }
        );
      } else {
        provider = await ServiceProvider.create(providerData, {
          transaction: t,
        });
      }

      // Handle employees - NEW IMPROVED VERSION
      if (parsedData.employees && Array.isArray(parsedData.employees)) {
        try {
          for (const [index, employee] of parsedData.employees.entries()) {
            try {
              const existingUser = await User.findOne({
                where: { email: employee.email, mobile: employee.phone },
                transaction: t,
              });

              let user;
              if (existingUser) {
                await existingUser.update(
                  {
                    name: employee.name,
                    mobile: employee.phone,
                    gender: employee.gender,
                  },
                  { transaction: t }
                );
                user = existingUser;
              } else {
                user = await User.create(
                  {
                    name: employee.name,
                    mobile: employee.phone,
                    email: employee.email,
                    tokenVersion: 1,
                    gender: employee.gender,
                    account_status: "pending",
                    role: "business_employee",
                  },
                  { transaction: t }
                );
              }

              const existingEmployee = await ServiceProviderEmployee.findOne({
                where: {
                  user_id: user.u_id,
                  provider_id: provider.provider_id,
                },
                transaction: t,
              });

              if (existingEmployee) {
                await existingEmployee.update(
                  {
                    role: employee.designation,
                    whatsapp_number:
                      employee?.whatsapp_number === ""
                        ? null
                        : employee?.whatsapp_number,
                    qualification: employee.qualification,
                    years_experience: 5,
                    status: "inactive",
                  },
                  { transaction: t }
                );
              } else {
                await ServiceProviderEmployee.create(
                  {
                    user_id: user.u_id,
                    provider_id: provider.provider_id,
                    role: employee.designation,
                    whatsapp_number:
                      employee?.whatsapp_number === ""
                        ? null
                        : employee?.whatsapp_number,
                    qualification: employee.qualification,
                    years_experience: 5,
                    status: "inactive",
                  },
                  { transaction: t }
                );
              }
            } catch (error) {
              console.error("Error processing employee:", error);
              await t.rollback();
              return res.status(400).json({
                error: "Employee validation failed",
                details: error.message,
                type: error.name,
                validation: error.errors?.map((e) => ({
                  field: `employee[${index}].${e.path}`,
                  value: e.value,
                  details: error.original?.detail || error.original?.message,
                  message: `Employee ${employee.name} ${e.message}`,
                })),
              });
            }
          }
        } catch (error) {
          console.error("Unexpected error in employee processing:", error);
          await t.rollback();
          throw error;
        }
      }

      // Handle categories
      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        await Promise.all(
          parsedData.categories.map(async (category) => {
            try {
              const existingCategory = await ProviderServiceCategory.findOne({
                where: {
                  provider_id: provider.provider_id,
                  category_id: category.id,
                },
                transaction: t,
              });

              if (existingCategory) {
                await existingCategory.update(
                  {
                    experience_years: Number(category.experience_years) || 0,
                    is_primary: Boolean(category.is_primary),
                  },
                  { transaction: t }
                );
              } else {
                await ProviderServiceCategory.create(
                  {
                    provider_id: provider.provider_id,
                    category_id: category.id,
                    experience_years: Number(category.experience_years) || 0,
                    is_primary: Boolean(category.is_primary),
                  },
                  { transaction: t }
                );
              }
            } catch (error) {
              console.error("Error processing category:", error);
              throw error;
            }
          })
        );
      }

      // Handle cities
      if (parsedData.cities && Array.isArray(parsedData.cities)) {
        await Promise.all(
          parsedData.cities.map(async (city) => {
            try {
              const existingCity = await ProviderServiceCity.findOne({
                where: { provider_id: provider.provider_id, city_id: city.id },
                transaction: t,
              });

              if (existingCity) {
                await existingCity.update(
                  {
                    service_radius: Number(city.service_radius) || 0,
                    is_primary: Boolean(city.is_primary),
                  },
                  { transaction: t }
                );
              } else {
                await ProviderServiceCity.create(
                  {
                    provider_id: provider.provider_id,
                    city_id: city.id,
                    service_radius: Number(city.service_radius) || 0,
                    is_primary: Boolean(city.is_primary),
                  },
                  { transaction: t }
                );
              }
            } catch (error) {
              console.error("Error processing city:", error);
              throw error;
            }
          })
        );
      }

      // Handle file uploads
      if (req.files) {
        const documentPromises = Object.keys(req.files).map((fieldName) => {
          const files = req.files[fieldName];
          const filesArray = Array.isArray(files) ? files : [files];

          return Promise.all(
            filesArray.map(async (file) => {
              if (file && file.path) {
                try {
                  const existingDocument =
                    await ServiceProviderDocument.findOne({
                      where: {
                        provider_id: provider.provider_id,
                        document_type: file.fieldname,
                      },
                      transaction: t,
                    });

                  if (existingDocument) {
                    await existingDocument.update(
                      {
                        document_url: file.path,
                        verification_status: "pending",
                      },
                      { transaction: t }
                    );
                  } else {
                    await ServiceProviderDocument.create(
                      {
                        provider_id: provider.provider_id,
                        document_type: file.fieldname,
                        document_url: file.path,
                        verification_status: "pending",
                      },
                      { transaction: t }
                    );
                  }
                } catch (error) {
                  console.error(
                    `Error processing document for field: ${fieldName}`,
                    error
                  );
                  throw error;
                }
              }
            })
          );
        });

        await Promise.all(documentPromises);
      }

      // Send registration confirmation email
      try {
        const user = await User.findByPk(provider.user_id);
        await MailService.sendRegistrationSuccessEmail(user);
      } catch (emailError) {
        console.error("Error sending registration email:", emailError);
      }

      // Commit transaction
      await t.commit();

      return res.status(201).json({
        message: existingProvider
          ? "Provider registration resubmitted successfully"
          : "Provider registered successfully",
        provider_id: provider.provider_id,
      });
    } catch (error) {
      if (t) await t.rollback();
      console.error("Provider registration error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        details: error.original?.detail || error.original?.message,
      });

      return res.status(500).json({
        error: "Provider registration failed",
        details: error.message,
        type: error.name,
        validation: error.errors?.map((e) => ({
          field: e.path,
          value: e.value,
          details: error.original?.detail || error.original?.message,
          message: e.message,
        })),
      });
    }
  }

  static async updateProviderStatus(req, res, next) {
    const transaction = await sequelize.transaction();

    console.log(req.body);

    try {
      const { status, rejection_reason, rejected_fields } = req.body;
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
          { model: User },
          {
            model: ServiceProviderEnquiry,
            as: "enquiry",
            required: false,
          },
          {
            model: ServiceProviderEmployee,
            as: "ServiceProviderEmployees",
            required: false,
          },
        ],
        transaction,
      });

      const providerDocuments = await ServiceProviderDocument.findAll({
        where: {
          provider_id: providerId,
        },
      });

      console.log(providerDocuments);

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
            const newRegistrationLink = await generateReRgistrationLink(
              provider.enquiry,
              rejected_fields
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

            if (providerDocuments && providerDocuments.length > 0) {
              const documentIds = providerDocuments.map(
                (doc) => doc.document_id
              );

              await ServiceProviderDocument.update(
                {
                  verification_status: "rejected",
                  verification_notes: "document-not-verified",
                },
                {
                  where: {
                    document_id: documentIds,
                  },
                  transaction,
                }
              );
            }

            try {
              await MailService.sendProviderRejectEmail(
                provider.User,
                rejection_reason,
                rejected_fields,
                newRegistrationLink
              );
            } catch (emailError) {
              console.error("Error sending rejection email:", emailError);
            }

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

      if (status === "active") {
        // If registration approved, activate their employees' accounts as well
        if (
          provider.ServiceProviderEmployees &&
          provider.ServiceProviderEmployees.length > 0
        ) {
          await Promise.all(
            provider.ServiceProviderEmployees.map(async (employee) => {
              try {
                await ServiceProviderEmployee.update(
                  {
                    status: "active",
                  },
                  {
                    where: {
                      provider_id: employee.provider_id,
                    },
                    transaction,
                  }
                );

                await User.update(
                  {
                    account_status: "active",
                  },
                  {
                    where: {
                      u_id: employee.user_id,
                    },
                    transaction,
                  }
                );

                const updatedUser = await User.findOne({
                  where: {
                    u_id: employee.user_id,
                  },
                });

                const passwordLink = await generatePasswordLink(updatedUser);
                console.log("Paswordlinkfor Employee ", passwordLink);
                await MailService.sendPasswordSetupEmail(
                  updatedUser,
                  passwordLink
                );
              } catch (error) {
                console.error("Error updating employee or user status:", error);
                throw error; // Rollback the transaction if there's an error
              }
            })
          );
        }
      }

      await User.update(
        {
          account_status: "active",
        },
        {
          where: {
            u_id: provider.User.u_id,
          },
          transaction,
        }
      );

      // For non-rejection status updates
      await provider.update(
        {
          status,

          ...(provider.status === "rejected"
            ? {
                rejection_reason: null,
                rejection_date: null,
              }
            : {}),
        },
        { transaction }
      );

      const passwordLink = await generatePasswordLink(provider.User);
      console.log("Paswordlinkfor Business Provider", passwordLink);
      await MailService.sendPasswordSetupEmail(provider.User, passwordLink);

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
    console.log(req.body.categories[0].services);
    const transaction = await sequelize.transaction();
    try {
      const { categories } = req.body;
      const providerId = req.params.id;

      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        await transaction.rollback();
        return res.status(404).json({ error: "Provider not found" });
      }

      // Delete existing categories
      await ProviderServiceCategory.destroy({
        where: { provider_id: providerId },
        transaction,
      });

      const categoryPromises = categories.map(async (category) => {
        console.log("Processing category:", category.category_id, category);

        const categoryData = {
          provider_id: providerId,
          category_id: category.category_id,
          experience_years: Number(category.experience_years) || 0,
          is_primary: Boolean(category.is_primary),
          status: "active",
        };

        if (category.services) {
          return Promise.all(
            category.services.map(async (service) => {
              if (!service.service_id) {
                console.error("Service is missing ID:", service);
                return;
              }

              const serviceData = {
                ...categoryData,
                service_id: service.service_id,
              };

              console.log("Inserting service:", serviceData);

              if (service.items) {
                return Promise.all(
                  service.items.map((item) => {
                    if (!item.item_id) {
                      console.error("Item is missing ID:", item);
                      return;
                    }

                    const itemData = {
                      ...serviceData,
                      item_id: item.item_id,
                      price_adjustment: item.price_adjustment || 0,
                    };

                    console.log("Inserting item:", itemData);

                    return ProviderServiceCategory.create(itemData, {
                      transaction,
                    });
                  })
                );
              }

              return ProviderServiceCategory.create(serviceData, {
                transaction,
              });
            })
          );
        }

        return ProviderServiceCategory.create(categoryData, { transaction });
      });

      await Promise.all(categoryPromises.flat());

      await transaction.commit();

      // Fetch updated permissions
      const updatedPermissions = await ProviderServiceCategory.findAll({
        where: { provider_id: providerId },
        include: [
          {
            model: ServiceCategory,
            attributes: ["category_id", "name"],
          },
          {
            model: Service,
            attributes: ["service_id", "name"],
          },
          {
            model: ServiceItem,
            attributes: ["item_id", "name"],
          },
        ],
      });

      res.status(200).json({
        message: "Service categories updated successfully",
        provider_id: providerId,
        permissions: updatedPermissions,
      });
    } catch (error) {
      await transaction.rollback();
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
    console.log(req.body);
    const transaction = await sequelize.transaction();
    try {
      const providerId = req.params.id;
      const updateData = req.body;

      console.log("updateData:", updateData);

      const provider = await ServiceProvider.findByPk(providerId, {
        include: [
          { model: User },
          { model: ServiceCategory, as: "serviceCategories" },
          { model: City, as: "serviceCities" },
        ],
      });

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

      // Handle empty WhatsApp number and alt number
      if (
        updateData.whatsapp_number === "" ||
        updateData.alternate_number === ""
      ) {
        updateData.whatsapp_number = null;
        updateData.alternate_number = null;
      }

      await provider.update(updateData, { transaction });

      const userUpdateData = {
        name: updateData.name,
        email: updateData.email,
        dob: updateData.dob || null,
        gender: updateData.gender,
        mobile: updateData.mobile,
        account_status: updateData.account_status,
      };

      if (updateData.email && updateData.email !== provider.User.email) {
        userUpdateData.email_verified = false;
      }

      await User.update(userUpdateData, {
        where: {
          u_id: provider.user_id,
        },
        transaction,
      });

      if (req.body.categories) {
        await ProviderServiceCategory.destroy({
          where: { provider_id: providerId },
          transaction,
        });

        // Add new categories
        const categoryPromises = req.body.categories.map((category) =>
          ProviderServiceCategory.create(
            {
              provider_id: providerId,
              category_id: category.category_id || category,
              experience_years: Number(category.experience_years) || 0,
              is_primary: Boolean(category.is_primary),
            },
            { transaction }
          )
        );

        await Promise.all(categoryPromises);
      }

      if (req.body.cities) {
        await ProviderServiceCity.destroy({
          where: { provider_id: providerId },
          transaction,
        });

        // Add new cities
        const cityPromises = req.body.cities.map((city) =>
          ProviderServiceCity.create(
            {
              provider_id: providerId,
              city_id: city.city_id || city,
              service_radius: Number(city.service_radius) || 0,
              is_primary: Boolean(city.is_primary),
            },
            { transaction }
          )
        );

        await Promise.all(cityPromises);
      }

      if (req.body.employees.length > 0) {
        const existingEmployees = await ServiceProviderEmployee.findAll({
          where: { provider_id: providerId },
          attributes: ["employee_id"],
          transaction,
        });

        const existingEmployeeIds = existingEmployees.map(
          (employee) => employee.employee_id
        );

        const updatedEmployeeIds = req.body.employees
          .filter((employee) => employee.employee_id)
          .map((employee) => employee.employee_id);

        const employeesToDelete = existingEmployeeIds.filter(
          (id) => !updatedEmployeeIds.includes(id)
        );

        if (employeesToDelete && employeesToDelete.length > 0) {
          // Fetch the user_ids of the employees to delete
          const employeesToDeleteData = await ServiceProviderEmployee.findAll({
            where: {
              employee_id: employeesToDelete,
            },
            attributes: ["user_id"],
            transaction,
          });

          // Extract the user_ids from the data
          const userIdsToDelete = employeesToDeleteData.map(
            (emp) => emp.user_id
          );

          // Delete ServiceProviderEmployee records
          await ServiceProviderEmployee.destroy({
            where: {
              employee_id: employeesToDelete,
            },
            transaction,
          });

          // Delete the corresponding User records
          if (userIdsToDelete.length > 0) {
            await User.destroy({
              where: {
                u_id: userIdsToDelete,
              },
              transaction,
            });
          }
        }

        await Promise.all(
          req.body.employees.map(async (employee) => {
            if (employee.employee_id) {
              // Update existing employee
              const businessEmployee = await ServiceProviderEmployee.findByPk(
                employee.employee_id,
                {
                  include: [
                    {
                      model: User,
                      attributes: ["email"],
                    },
                  ],
                  transaction,
                }
              );

              await ServiceProviderEmployee.update(
                {
                  role: employee.role,
                  status: employee.status,
                  qualification: employee.qualification,
                  years_experience: employee.years_experience,
                  whatsapp_number:
                    employee?.whatsapp_number === ""
                      ? null
                      : employee?.whatsapp_number,
                },
                {
                  where: {
                    employee_id: employee.employee_id,
                  },
                  transaction,
                }
              );

              const empUpdateData = {
                name: employee?.User?.name,
                email: employee?.User?.email,
                account_status: employee?.User?.account_status,
                mobile: employee?.User?.mobile,
                gender: employee?.User?.gender,
                dob: employee?.User?.dob,
              };

              if (
                empUpdateData.email &&
                empUpdateData.email !== businessEmployee?.User?.email
              ) {
                empUpdateData.email_verified = false;
              }

              await User.update(empUpdateData, {
                where: {
                  u_id: employee.user_id,
                },
                transaction,
              });
            } else {
              // Add new employee
              const newEmployee = await User.create(
                {
                  name: employee?.User?.name,
                  email: employee?.User?.email,
                  role: "business_employee",
                  account_status: "active",
                  mobile: employee?.User?.mobile,
                  gender: employee?.User?.gender,
                  dob: employee?.User?.dob,
                },
                {
                  transaction,
                }
              );

              await ServiceProviderEmployee.create(
                {
                  provider_id: providerId,
                  user_id: newEmployee?.u_id,
                  role: employee?.role,
                  status: employee?.status,
                  qualification: employee?.qualification,
                  years_experience: employee?.years_experience,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
                {
                  transaction,
                }
              );
            }
          })
        );
      }

      await transaction.commit();

      res.status(200).json({
        message: "Provider profile updated successfully",
        provider_id: providerId,
      });
    } catch (error) {
      console.error("Provider update error:", error);
      next(error);
    }
  }

  static async updateProviderAvailability(req, res, next) {
    try {
      const providerId = req.params.id;
      const availability_hours = req.body;

      console.log(req.body);
      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      let parsedAvailabilityHours = availability_hours;
      if (typeof availability_hours === "string") {
        try {
          parsedAvailabilityHours = JSON.parse(availability_hours);
        } catch (error) {
          console.error(`Error parsing availability_hours:`, error);
          return res
            .status(400)
            .json({ error: "Invalid JSON format for availability_hours" });
        }
      }

      await provider.update({ availability_hours: parsedAvailabilityHours });

      res.status(200).json({
        message: "Provider availability updated successfully",
        provider_id: providerId,
      });
    } catch (error) {
      console.error("Provider update error:", error);
      next(error);
    }
  }
}

module.exports = ServiceProviderController;
