const { User } = require('../models');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const otpHandler = require('../utils/otp');
const { Op } = require('sequelize');

const AuthController = {
  async sendLoginOTP(req, res, next) {
    try {
      const { mobile } = req.body;

      if (!mobile) {
        throw createError(400, 'Mobile number is required');
      }

      const [user] = await User.findOrCreate({
        where: { mobile },
        defaults: {
          name: `User-${mobile.slice(-4)}`,
          role: 'customer',
        }
      });

      const otp = await otpHandler.sendOTP(mobile);

      await user.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
        updated_by: 'system'
      });

      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      if (error.message.includes('Please wait')) {
        return res.status(429).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },

  async verifyOTP(req, res, next) {
    try {
      const { mobile, otp } = req.body;

      if (!mobile || !otp) {
        throw createError(400, 'Mobile and OTP are required');
      }

      const isValid = otpHandler.verifyOTP(mobile, otp);
      
      if (!isValid) {
        throw createError(401, 'Invalid OTP');
      }

      const user = await User.findOne({
        where: {
          mobile,
          otp,
          otp_expires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        throw createError(401, 'Invalid or expired OTP');
      }

      await user.update({
        otp: null,
        otp_expires: null,
        last_login: new Date(),
        updated_by: 'system'
      });

      const accessToken = jwt.sign(
        {
          id: user.u_id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      const refreshToken = jwt.sign(
        {
          id: user.u_id,
          tokenVersion: user.tokenVersion
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '14d' }
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 14 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        role: user.role,
        uId: user.u_id
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        throw createError(401, 'Refresh token required');
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw createError(401, 'Invalid refresh token');
      }

      const accessToken = jwt.sign(
        {
          id: user.u_id,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (req.user) {
        await User.increment('tokenVersion', {
          where: { u_id: req.user.id }
        });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;