// controllers/userController.js
const { User } = require('../models');

class UserController {
  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll({
        order: [['u_id', 'DESC']],
      });
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  // Create new user
  static async createUser(req, res, next) {
    try {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        photo: req.body.photo,
        pw: req.body.pw || '1234',
        role: req.body.role || 'customer',
        gender: req.body.gender,
        nic: req.body.nic,
        dob: req.body.dob
      });
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
    try {
      const [updated] = await User.update(req.body, {
        where: { u_id: req.params.id },
        returning: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await User.findByPk(req.params.id);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req, res, next) {
    try {
      const deleted = await User.destroy({
        where: { u_id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Additional methods for email and mobile lookup
  static async getUserByEmail(req, res, next) {
    try {
      const user = await User.findOne({
        where: { email: req.params.email },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getUserByMobile(req, res, next) {
    try {
      const user = await User.findOne({
        where: { mobile: req.params.mobile },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;