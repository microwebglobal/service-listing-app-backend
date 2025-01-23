// controllers/userController.js
const { where } = require("sequelize");
const { User } = require("../models");
const bcryptjs = require("bcryptjs");

class UserController {
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password", "otp", "otp_expires"] },
      });

      if (!user) {
        throw createError(404, "User not found");
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const allowedFields = ["name", "email", "gender", "dob", "nic"];

      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const [updated] = await User.update(updateData, {
        where: { u_id: userId },
        returning: true,
      });

      if (!updated) {
        throw createError(404, "User not found");
      }

      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password", "otp", "otp_expires"] },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUserAddresses(req, res, next) {
    try {
      const userId = req.user.id;
      const addresses = await Address.findAll({
        where: { userId },
        order: [
          ["is_primary", "DESC"],
          ["createdAt", "DESC"],
        ],
      });

      res.json(addresses);
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req, res, next) {
    try {
      const userId = req.user.id;
      const address = await Address.create({
        ...req.body,
        userId,
        is_primary: req.body.is_primary || false,
      });

      if (address.is_primary) {
        await Address.update(
          { is_primary: false },
          {
            where: {
              userId,
              id: { [Op.ne]: address.id },
            },
          }
        );
      }

      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const address = await Address.findOne({
        where: { id, userId },
      });

      if (!address) {
        throw createError(404, "Address not found");
      }

      await address.update(req.body);

      if (address.is_primary) {
        await Address.update(
          { is_primary: false },
          {
            where: {
              userId,
              id: { [Op.ne]: address.id },
            },
          }
        );
      }

      res.json(address);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await Address.destroy({
        where: { id, userId },
      });

      if (!deleted) {
        throw createError(404, "Address not found");
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async setUserPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const { id } = req.params;

      const hashedPassword = await bcryptjs.hash(password, 10);

      await User.update(
        {
          pw: hashedPassword,
        },
        { where: { u_id: id } }
      );

      res.status(200).json({
        message: "Password SetUp Successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
