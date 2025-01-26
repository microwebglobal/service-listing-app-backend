const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");

require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  console.log("Cookies:", req.cookies); // Log cookies to debug

  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw createError(401, "Invalid or inactive user");
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error = createError(401, "Invalid or expired token");
    }
    next(error);
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, "Insufficient permissions"));
    }
    next();
  };
};

module.exports = {
  roleCheck,
  authMiddleware,
};
