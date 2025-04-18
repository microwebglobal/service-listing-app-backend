const { CustomerProfile, User } = require("../models");
const createError = require("http-errors");
const { generateEmailValidationLink } = require("../utils/helpers");

class CustomerProfileController {
  static async getAllProfiles(req, res, next) {
    try {
      const profiles = await CustomerProfile.findAll({
        order: [["cp_id", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email"],
          },
        ],
      });
      res.status(200).json(profiles);
    } catch (error) {
      next(error);
    }
  }

  static async getProfileById(req, res, next) {
    try {
      console.log(req.params.id);
      const profile = await CustomerProfile.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email"],
          },
        ],
      });

      if (!profile) {
        throw createError(404, "Profile not found");
      }

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async getProfileByUserId(req, res, next) {
    try {
      // const profile = await CustomerProfile.findOne({
      //   where: { u_id: req.params.uId },
      //   include: [
      //     {
      //       model: User,
      //       as: "user",
      //       attributes: ["name", "email"],
      //     },
      //   ],
      // });

      const profile = await User.findByPk(req.params.uId);

      if (!profile) {
        throw createError(404, "Profile not found for the given user ID");
      }

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async createProfile(req, res, next) {
    console.log(req.body);
    try {
      const newProfile = await CustomerProfile.create({
        u_id: req.body.u_id,
        tier_status: "Bronze",
        loyalty_points: 0,
        default_address: "",
      });

      const profileWithUser = await CustomerProfile.findByPk(newProfile.cp_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name", "email"],
          },
        ],
      });

      res.status(201).json(profileWithUser);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      // const [updated] = await CustomerProfile.update(
      //   {
      //     ...req.body,
      //     updated_by: req.user?.username || "system",
      //   },
      //   {
      //     where: { cp_id: req.params.id },
      //     returning: true,
      //   }
      // );

      // if (!updated) {
      //   throw createError(404, "Profile not found");
      // }

      // const updatedProfile = await CustomerProfile.findByPk(req.params.id, {
      //   include: [
      //     {
      //       model: User,
      //       as: "user",
      //       attributes: ["name", "email"],
      //     },
      //   ],
      // });

      // res.status(200).json(updatedProfile);
      console.log(req);

      await User.update(
        {
          name: req.body.name,
          email: req.body.email,
          email_verified: false,
          gender: req.body.gender,
          dob: req.body.dob,
        },
        {
          where: {
            u_id: req.params.id,
          },
        }
      );
      res.status(200).json(User);
    } catch (error) {
      next(error);
    }
  }

  static async updateLoyaltyPoints(req, res, next) {
    try {
      const { loyalty_points } = req.body;
      const [updated] = await CustomerProfile.update(
        {
          loyalty_points,
          updated_by: req.user?.username || "system",
        },
        {
          where: { cp_id: req.params.id },
          returning: true,
        }
      );

      if (!updated) {
        throw createError(404, "Profile not found");
      }

      const updatedProfile = await CustomerProfile.findByPk(req.body.id);
      res.status(200).json(updatedProfile);
    } catch (error) {
      next(error);
    }
  }

  static async sendEmailVarificationLink(req, res, next) {
    const user = await User.findByPk(req.params.uId);
    try {
      const emailLink = generateEmailValidationLink(user);
      console.log(emailLink);
      res.status(200).json({
        message: "Email Validation Link Sent",
        emailLink: emailLink,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCustomerEmail(req, res, next) {
    try {
      await User.update(
        {
          email_verified: true,
        },
        {
          where: {
            u_id: req.params.id,
          },
        }
      );
      res.status(200).json(User);
    } catch (error) {
      console.error();
    }
  }

  static async updateTierStatus(req, res, next) {
    try {
      const { tier_status } = req.body;
      const [updated] = await CustomerProfile.update(
        {
          tier_status,
          updated_by: req.user?.username || "system",
        },
        {
          where: { cp_id: req.params.id },
          returning: true,
        }
      );

      if (!updated) {
        throw createError(404, "Profile not found");
      }

      const updatedProfile = await CustomerProfile.findByPk(req.params.id);
      res.status(200).json(updatedProfile);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(req, res, next) {
    try {
      const deleted = await CustomerProfile.destroy({
        where: { cp_id: req.params.id },
      });

      if (!deleted) {
        throw createError(404, "Profile not found");
      }

      res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerProfileController;
