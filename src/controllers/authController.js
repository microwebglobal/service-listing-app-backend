// src/controllers/authController.js
const { User } = require('../models');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        throw createError(400, 'Email and password are required');
      }

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw createError(401, 'Invalid credentials');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.pw);
      if (!isValidPassword) {
        throw createError(401, 'Invalid credentials');
      }

      // Check if user is active
      if (!user.is_active) {
        throw createError(403, 'Account is deactivated');
      }

      // Generate tokens
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update last login
      await user.update({
        last_login: new Date(),
        updated_by: 'system'
      });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.u_id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw createError(400, 'Refresh token is required');
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw createError(401, 'Invalid refresh token');
      }

      const accessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // Increment token version to invalidate all existing refresh tokens
      await User.update(
        {
          tokenVersion: sequelize.literal('tokenVersion + 1'),
          updated_by: req.user.username
        },
        {
          where: { u_id: req.user.id }
        }
      );

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;