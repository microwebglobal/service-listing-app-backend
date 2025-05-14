const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");
const ProviderBookingController = require("../controllers/ProviderBookingController");

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

const checkDuePayouts = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    console.log(userId);

    if (!userId) return next();

    const fakeRes = {
      statusCode: 200,
      data: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.data = payload;
      },
    };

    req.params.provider_id = userId;

    await ProviderBookingController.getProviderDuePayouts(req, fakeRes);

    const totalDue = parseFloat(fakeRes.data?.totalDuePayable || 0);

    console.log(totalDue);

    const user = await User.findByPk(userId);
    if (totalDue > 0 && user.account_status !== "suspended") {
      user.account_status = "suspended";
      await user.save();
    }

    req.user.account_status = user.account_status;

    next();
  } catch (err) {
    console.error("Due Payout Check Failed:", err);
    next(createError(500, "Error checking due payouts"));
  }
};

module.exports = {
  authMiddleware,
  roleCheck,
  checkDuePayouts,
};
