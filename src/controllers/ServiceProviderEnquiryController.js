const {
  ServiceProviderEnquiry,
  User,
  ServiceCategory,
  City,
} = require("../models");
const { generateRegistrationLink } = require("../utils/helpers.js");
const { sequelize } = require("../models");

class ServiceProviderEnquiryController {
  static async getAllEnquiries(req, res, next) {
    try {
      const enquiries = await ServiceProviderEnquiry.findAll({
        include: [{ model: User }, { model: ServiceCategory }, { model: City }],
        order: [["enquiry_id", "DESC"]],
      });
      res.status(200).json(enquiries);
    } catch (error) {
      next(error);
    }
  }

  static async getEnquirieById(req, res, next) {
    try {
      const enquirie = await ServiceProviderEnquiry.findByPk(req.params.id, {
        include: [{ model: User }, { model: ServiceCategory }, { model: City }],
        order: [["enquiry_id", "DESC"]],
      });
      if (!enquirie) {
        return res.status(404).json({ error: "Enquirie not found" });
      }
      res.status(200).json(enquirie);
    } catch (error) {
      next(error);
    }
  }

  static async createEnquiry(req, res, next) {
    try {
      const { type } = req.body;

      // Validate provider type
      if (!type || !["individual", "business"].includes(type)) {
        return res.status(400).json({
          error:
            "Invalid business_type. Must be either 'individual' or 'business'",
        });
      }

      if (type === "business") {
        return await ServiceProviderEnquiryController.createBusinessEnquiry(
          req,
          res,
          next
        );
      } else {
        return await ServiceProviderEnquiryController.createIndividualEnquiry(
          req,
          res,
          next
        );
      }
    } catch (error) {
      next(error);
    }
  }

  static async createBusinessEnquiry(req, res, next) {
    const t = await sequelize.transaction();

    try {
      const {
        business_name,
        authorized_person_name,
        authorized_person_contact,
        business_type,
        business_website,
        service_location,
        categories,
        number_of_employees,
        email,
        gender,
      } = req.body;

      console.log(req.body);

      const existingBusiness = await ServiceProviderEnquiry.findOne({
        where: {
          business_name,
          business_type: "business",
        },
        transaction: t,
      });

      if (existingBusiness) {
        await t.rollback();
        return res.status(409).json({
          error: "Business already registered",
          details: "A business with this name already exists",
        });
      }

      const user = await User.create(
        {
          name: authorized_person_name,
          email,
          mobile: authorized_person_contact,
          account_status: "active",
          tokenVersion: 1,
          gender: gender,
          account_status: "pending",
          role: "business_service_provider",
        },
        { transaction: t }
      );

      // Create enquiry - without specifying enquiry_id to let it auto-increment
      const enquiryData = {
        user_id: user.u_id,
        business_type: "business",
        business_name,
        business_website,
        primary_location: service_location,
        number_of_employees: Number(number_of_employees),
        authorized_person_name,
        gender: gender,
        authorized_person_contact,
        status: "pending",
      };

      const enquiry = await ServiceProviderEnquiry.create(enquiryData, {
        transaction: t,
        returning: true,
      });

      // Handle categories
      if (Array.isArray(categories) && categories.length > 0) {
        const validCategories = await ServiceCategory.findAll({
          where: { category_id: categories },
          transaction: t,
        });

        if (validCategories.length !== categories.length) {
          await t.rollback();
          return res.status(400).json({
            error: "Invalid categories",
            details: "One or more category IDs are invalid",
          });
        }

        await enquiry.setServiceCategories(validCategories, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        message: "Business enquiry created successfully",
        enquiry_id: enquiry.enquiry_id,
      });
    } catch (error) {
      await t.rollback();
      console.error("Business enquiry creation error:", {
        name: error.name,
        message: error.message,
        details: error.original?.detail,
      });

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Duplicate entry",
          details: error.errors.map((e) => e.message),
        });
      }

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((e) => e.message),
        });
      }

      next(error);
    }
  }

  static async createIndividualEnquiry(req, res, next) {
    const t = await sequelize.transaction();

    try {
      const {
        name,
        email,
        mobile,
        gender,
        dob,
        years_experience,
        categories,
        cities,
        location,
        skills,
      } = req.body;

      // Create user without specifying u_id
      const user = await User.create(
        {
          name,
          email,
          mobile,
          gender,
          dob,
          account_status: "pending",
          tokenVersion: 1,
          role: "service_provider",
        },
        { transaction: t }
      );

      // Create enquiry without specifying enquiry_id
      const enquiryData = {
        user_id: user.u_id,
        business_type: "individual",
        years_experience: Number(years_experience),
        primary_location: location,
        gender: gender,
        skills,
        status: "pending",
      };

      const enquiry = await ServiceProviderEnquiry.create(enquiryData, {
        transaction: t,
        returning: true,
      });

      // Handle categories
      if (Array.isArray(categories) && categories.length > 0) {
        const validCategories = await ServiceCategory.findAll({
          where: { category_id: categories },
          transaction: t,
        });

        if (validCategories.length !== categories.length) {
          await t.rollback();
          return res.status(400).json({
            error: "Invalid categories",
            details: "One or more category IDs are invalid",
          });
        }

        await enquiry.setServiceCategories(validCategories, { transaction: t });
      }

      // Handle cities
      if (Array.isArray(cities) && cities.length > 0) {
        const validCities = await City.findAll({
          where: { city_id: cities },
          transaction: t,
        });

        if (validCities.length !== cities.length) {
          await t.rollback();
          return res.status(400).json({
            error: "Invalid cities",
            details: "One or more city IDs are invalid",
          });
        }

        await enquiry.setCities(validCities, { transaction: t });
      }

      await t.commit();

      res.status(201).json({
        message: "Individual enquiry created successfully",
        enquiry_id: enquiry.enquiry_id,
      });
    } catch (error) {
      await t.rollback();
      console.error("Individual enquiry creation error:", {
        name: error.name,
        message: error.message,
        details: error.original?.detail,
      });

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Duplicate entry",
          details: error.errors.map((e) => e.message),
        });
      }

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((e) => e.message),
        });
      }

      next(error);
    }
  }

  static handleError(error, res, next) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "Duplicate entry",
        details: error.errors.map((e) => e.message),
      });
    }

    console.error("Service Provider Enquiry Creation Error:", error);
    return next(error);
  }

  static async approveEnquiry(req, res, next) {
    try {
      const enquiry = await ServiceProviderEnquiry.findByPk(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ error: "Enquiry not found" });
      }

      if (enquiry.status === "approved") {
        return res.status(409).json({
          error: "Enquiry already approved",
          registration_link: enquiry.registration_link,
        });
      }

      const registrationLink = await generateRegistrationLink(enquiry);

      console.log(registrationLink);
      await enquiry.update({
        status: "approved",
        registration_link: registrationLink,
        registration_link_expires: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ), // 7 days
      });

      res.status(200).json({
        message: "Enquiry approved",
        registration_link: registrationLink,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceProviderEnquiryController;
