const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw createError(401, 'Invalid or inactive user');
    }

    req.user = {
      id: user.u_id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = createError(401, 'Invalid or expired token');
    }
    next(error);
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, 'Insufficient permissions'));
    }
    next();
  };
};

module.exports = {
  roleCheck,
  authMiddleware
};
