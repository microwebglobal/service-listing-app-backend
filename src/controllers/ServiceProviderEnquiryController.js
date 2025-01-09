const {
  ServiceProviderEnquiry,
  User,
  ServiceCategory,
  City,
} = require("../models");
const { generateRegistrationLink } = require("../utils/helpers.js");

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
        return res.status(404).json({ error: "enquirie not found" });
      }
      res.status(200).json(enquirie);
    } catch (error) {
      next(error);
    }
  }

  static async createEnquiry(req, res, next) {
    try {
      const {
        name,
        email,
        mobile,
        gender,
        business_type,
        business_name,
        dob,
        years_experience,
        categories,
        cities,
        location,
        skills,
      } = req.body;

      console.log(req.body);
      // First create user
      const user = await User.create({
        name: name,
        email: email,
        mobile: mobile,
        gender: gender,
        dob: dob,
        account_status: "active",
        tokenVersion: 1,
        role:
          business_type === "business"
            ? "business_service_provider"
            : "service_provider",
      });

      console.log(user);

      // Create enquiry
      const enquiry = await ServiceProviderEnquiry.create({
        user_id: user.u_id,
        business_type,
        business_name,
        years_experience,
        primary_location: location,
        skills,
      });

      // Add categories and cities
      await enquiry.setServiceCategories(categories);
      await enquiry.setCities(cities);

      res.status(201).json({
        message: "Enquiry submitted successfully",
        enquiry_id: enquiry.enquiry_id,
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveEnquiry(req, res, next) {
    try {
      const enquiry = await ServiceProviderEnquiry.findByPk(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ error: "Enquiry not found" });
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
