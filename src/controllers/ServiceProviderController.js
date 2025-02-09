const { where } = require("sequelize");
const {
  ServiceProvider,
  User,
  City,
  ServiceCategory,
  ProviderServiceCategory,
  ProviderServiceCity,
  ServiceProviderEnquiry,
  ServiceProviderEmployee,
  ServiceProviderDocument,
} = require("../models");
const { sequelize } = require("../models");
const MailService = require('../utils/mail.js');

const {
  generateRegistrationLink,
  generatePasswordLink,
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
          { model: ServiceCategory, as: "serviceCategories" },
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
          { model: ServiceCategory, as: "serviceCategories" },
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

  static async registerProvider(req, res, next) {
    let t;
    try {
      t = await sequelize.transaction();
      
      const { 
        enquiry_id, 
        business_registration_number, 
        service_radius, 
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
        reference_number, 
        reference_name, 
        aadhar_number, 
        pan_number, 
        certificates_awards 
      } = req.body;
  
      // Find and validate enquiry
      const enquiry = await ServiceProviderEnquiry.findByPk(enquiry_id, { transaction: t });
      
      if (!enquiry) {
        await t.rollback();
        return res.status(404).json({
          error: "Invalid registration link",
          message: "This registration link is invalid or has expired"
        });
      }
  
      if (enquiry.status === "completed") {
        await t.rollback();
        return res.status(409).json({
          error: "Registration already completed",
          message: "This registration has already been completed"
        });
      }
  
      if (enquiry.registration_link_expires && new Date() > new Date(enquiry.registration_link_expires)) {
        await t.rollback();
        return res.status(410).json({
          error: "Registration link expired",
          message: "This registration link has expired. Please request a new one"
        });
      }
  
      // Parse JSON data
      let parsedData;
      try {
        parsedData = {
          availabilityHours: typeof availability_hours === "string" ? JSON.parse(availability_hours) : availability_hours,
          socialMediaLinks: typeof social_media_links === "string" ? JSON.parse(social_media_links) : social_media_links,
          paymentDetails: typeof payment_details === "string" ? JSON.parse(payment_details) : payment_details,
          categories: typeof categories === "string" ? JSON.parse(categories) : categories,
          cities: typeof cities === "string" ? JSON.parse(cities) : cities,
          employees: typeof employees === "string" ? JSON.parse(employees) : employees
        };
      } catch (parseError) {
        await t.rollback();
        return res.status(400).json({
          error: "Invalid JSON data in request",
          details: parseError.message
        });
      }
  
      // Update enquiry status
      await ServiceProviderEnquiry.update({
        status: "completed",
        registration_link_expires: new Date(),
        registration_completed_at: new Date()
      }, { 
        where: { enquiry_id },
        transaction: t 
      });
  
      // Process arrays
      const processedLanguages = Array.isArray(languages_spoken) ? languages_spoken : languages_spoken ? [languages_spoken] : [];
      const processedSpecializations = Array.isArray(specializations) ? specializations : specializations ? [specializations] : [];
  
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
        status: "pending_approval"
      };
  
      // Check for existing provider
      const existingProvider = await ServiceProvider.findOne({
        where: {
          user_id: enquiry.user_id,
          status: "rejected"
        },
        transaction: t
      });
  
      // Create or update provider
      let provider;
      if (existingProvider) {
        provider = await existingProvider.update({
          ...providerData,
          rejection_reason: null,
          rejection_date: null,
          status: "pending_approval"
        }, { transaction: t });
      } else {
        provider = await ServiceProvider.create(providerData, { transaction: t });
      }
  
      // Handle employees
      if (parsedData.employees && Array.isArray(parsedData.employees)) {
        await Promise.all(parsedData.employees.map(async (employee) => {
          try {
            const user = await User.create({
              name: employee.name,
              mobile: employee.phone,
              tokenVersion: 1,
              gender: employee.gender,
              account_status: "pending",
              role: "business_employee"
            }, { transaction: t });
  
            await ServiceProviderEmployee.create({
              user_id: user.u_id,
              provider_id: provider.provider_id,
              role: employee.designation,
              qualification: employee.qualification,
              years_experience: 5,
              status: "inactive"
            }, { transaction: t });
          } catch (error) {
            console.error("Error creating employee:", error);
            throw error; // This will trigger transaction rollback
          }
        }));
      }
  
      // Handle categories
      if (parsedData.categories && Array.isArray(parsedData.categories)) {
        await Promise.all(parsedData.categories.map(async (category) => {
          try {
            await ProviderServiceCategory.create({
              provider_id: provider.provider_id,
              category_id: category.id,
              experience_years: Number(category.experience_years) || 0,
              is_primary: Boolean(category.is_primary)
            }, { transaction: t });
          } catch (error) {
            console.error("Error creating category:", error);
            throw error;
          }
        }));
      }
  
      // Handle cities
      if (parsedData.cities && Array.isArray(parsedData.cities)) {
        await Promise.all(parsedData.cities.map(async (city) => {
          try {
            await ProviderServiceCity.create({
              provider_id: provider.provider_id,
              city_id: city.id,
              service_radius: Number(city.service_radius) || 0,
              is_primary: Boolean(city.is_primary)
            }, { transaction: t });
          } catch (error) {
            console.error("Error creating city:", error);
            throw error;
          }
        }));
      }
  
      // Handle file uploads
      if (req.files) {
        const documentPromises = Object.keys(req.files).map((fieldName) => {
          const files = req.files[fieldName];
          const filesArray = Array.isArray(files) ? files : [files];
          
          return Promise.all(filesArray.map(async (file) => {
            if (file && file.path) {
              try {
                await ServiceProviderDocument.create({
                  provider_id: provider.provider_id,
                  document_type: file.fieldname,
                  document_url: file.path,
                  verification_status: "pending"
                }, { transaction: t });
              } catch (error) {
                console.error(`Error inserting document for field: ${fieldName}`, error);
                throw error;
              }
            }
          }));
        });
  
        await Promise.all(documentPromises);
      }
  
      // Send registration confirmation email
      try {
        const user = await User.findByPk(provider.user_id);
        await MailService.sendRegistrationSuccessEmail(user);
      } catch (emailError) {
        console.error('Error sending registration email:', emailError);
      }
  
      // Commit transaction
      await t.commit();
  
      return res.status(201).json({
        message: existingProvider ? "Provider registration resubmitted successfully" : "Provider registered successfully",
        provider_id: provider.provider_id
      });
  
    } catch (error) {
      if (t) await t.rollback();
      console.error("Provider registration error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        details: error.original?.detail || error.original?.message
      });
  
      return res.status(500).json({
        error: "Provider registration failed",
        details: error.message,
        type: error.name,
        validation: error.errors?.map((e) => ({
          field: e.path,
          message: e.message
        }))
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
                await MailService.sendPasswordSetupEmail(updatedUser, passwordLink);

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
    console.log(req.body);
    const transaction = await sequelize.transaction();
    try {
      const providerId = req.params.id;
      const updateData = req.body;

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
      const updateData = req.body;

      const provider = await ServiceProvider.findByPk(providerId);

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      // Handle JSON fields
      const jsonFields = ["availability_hours"];
      jsonFields.forEach((field) => {
        if (updateData[field] && typeof updateData[field] === "string") {
          try {
            updateData[field] = JSON.parse(updateData[field]);
          } catch (error) {
            console.error(`Error parsing ${field}:`, error);
          }
        }
      });

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
