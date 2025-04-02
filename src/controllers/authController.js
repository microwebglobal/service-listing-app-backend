const { User, ServiceProvider } = require("../models");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

class AuthController {
  constructor() {
    this.customerSendOTP = this.customerSendOTP.bind(this);
    this.customerVerifyOTP = this.customerVerifyOTP.bind(this);
    this.adminLogin = this.adminLogin.bind(this);
    this.providerLogin = this.providerLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async customerSendOTP(req, res, next) {
    try {
      const { mobile } = req.body;

      if (!mobile) {
        throw createError(400, "Mobile number is required");
      }

      const [user] = await User.findOrCreate({
        where: {
          mobile,
          role: "customer",
        },
        defaults: {
          name: `User-${mobile.slice(-4)}`,
          account_status: "active",
        },
      });

      if (user.account_status !== "active") {
        throw createError(403, "Account is not active");
      }

      const otp = "123456";

      console.log(otp); //loggr to print otp

      await user.update({
        otp,
        otp_expires: new Date(Date.now() + 5 * 60 * 1000),
        mobile_verified: true,
      });

      // In production, send OTP via SMS here

      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async customerVerifyOTP(req, res, next) {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            throw createError(400, "Mobile and OTP are required");
        }

        let firstTimeLogin = false;

        // Check if the mobile number exists
        let user = await User.findOne({
            where: { mobile, role: "customer" }
        });

        if (!user) {
            // If user doesn't exist, create a new one
            user = await User.create({
                mobile,
                role: "customer",
                name: `User-${mobile}`, // Default name format "User-<mobile>"
                last_login: new Date(),
                otp, // Save OTP for first-time login
                otp_expires: new Date(Date.now() + 5 * 60 * 1000) // OTP valid for 5 min
            });

            firstTimeLogin = true; // Mark as first-time login
        } else {
            // If the name is in the format "User-<mobile>", it's a first-time login
            if (user.name.startsWith('User-')) {
                firstTimeLogin = true;
            }
        }

        // Validate OTP
        if (!user.otp || user.otp !== otp || user.otp_expires < new Date()) {
            throw createError(402, "Invalid or expired OTP");
        }

        // Update user details after successful OTP verification
        await user.update({
            otp: null,
            otp_expires: null,
            last_login: new Date(),
        });

        const tokens = this.generateTokens(user);
        this.setTokenCookies(res, tokens);

        res.json({
            success: true,
            first_time_login: firstTimeLogin,
            user: {
                id: user.u_id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                email: user.email,
                photo: user.photo,
            },
        });

    } catch (error) {
        next(error);
    }
}

  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError(400, "Email and password are required");
      }

      const user = await User.findOne({
        where: {
          email,
          role: "admin",
        },
      });

      if (!user || !(await user.validatePassword(password))) {
        throw createError(401, "Invalid credentials");
      }

      if (user.account_status !== "active") {
        throw createError(403, "Account is not active");
      }

      await user.update({ last_login: new Date() });

      const tokens = this.generateTokens(user);
      this.setTokenCookies(res, tokens);

      res.json({
        success: true,
        user: {
          id: user.u_id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async providerLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError(400, "Email and password are required");
      }

      const user = await User.findOne({
        where: {
          email,
          role: [
            "service_provider",
            "business_service_provider",
            "business_employee",
          ],
        },
      });

      if (!user || !(await user.validatePassword(password))) {
        throw createError(401, "Invalid credentials");
      }

      if (user.account_status !== "active") {
        throw createError(403, "Account is not active");
      }

      const provider = await ServiceProvider.findOne({
        where: { user_id: user?.u_id },
      });

      await user.update({ last_login: new Date() });

      const tokens = this.generateTokens(user);
      this.setTokenCookies(res, tokens);

      res.json({
        success: true,
        user: {
          id: user.u_id,
          provider: provider?.provider_id,
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    console.log("refreshToken");
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        console.log("No refresh token, first login");
        return res.json({ success: false, message: "first login" });
      }

      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(payload.id);

      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw createError(401, "Invalid refresh token");
      }

      const tokens = this.generateTokens(user);
      this.setTokenCookies(res, tokens);

      res.json({ success: true });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        error = createError(401, "Invalid refresh token");
      }
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      if (req.user) {
        await User.increment("tokenVersion", {
          where: { u_id: req.user.id },
        });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.u_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user.u_id, tokenVersion: user.tokenVersion },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "90d" }
    );

    return { accessToken, refreshToken };
  }

  setTokenCookies(res, { accessToken, refreshToken }) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });
  }
}

module.exports = AuthController;
