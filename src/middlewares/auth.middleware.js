const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");

require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw createError(401, "Authentication required");
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Set user info from decoded token with both id and u_id
    req.user = {
      id: decoded.id,
      u_id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(createError(401, "Invalid or expired token"));
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
  authMiddleware,
  roleCheck,
};
