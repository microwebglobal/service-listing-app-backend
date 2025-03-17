const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateRegistrationLink = async (enquiry) => {
  try {
    const tokenData = {
      eid: enquiry.enquiry_id,
      uid: enquiry.user_id,
      t: enquiry.business_type[0],
      ts: Math.floor(Date.now() / 1000),
    };

    const randomBytes = crypto.randomBytes(8).toString("base64url");
    tokenData.n = randomBytes;

    const token = jwt.sign(
      tokenData,
      config.development.registration.secretKey,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const registrationLink = `${process.env.FRONTEND_URL}/service-provider/register/${token}`;

    return registrationLink;
  } catch (error) {
    throw new Error("Failed to generate registration link");
  }
};

const validateRegistrationLink = async (token) => {
  try {
    const decoded = jwt.verify(token, config.registration.secretKey);

    const expandedData = {
      enquiry_id: decoded.eid,
      user_id: decoded.uid,
      business_type: decoded.t === "b" ? "business" : "individual",
      timestamp: decoded.ts * 1000,
      nonce: decoded.n,
    };

    const enquiry = await ServiceProviderEnquiry.findOne({
      where: {
        enquiry_id: expandedData.enquiry_id,
        status: "approved",
        registration_link_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!enquiry) {
      throw new Error("Invalid or expired registration link");
    }

    const existingProvider = await ServiceProvider.findOne({
      where: { user_id: expandedData.user_id },
    });

    if (existingProvider) {
      throw new Error("Service provider already registered");
    }

    return expandedData;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid registration link");
    }
    if (error.name === "TokenExpiredError") {
      throw new Error("Registration link has expired");
    }
    throw error;
  }
};

const invalidateRegistrationLink = async (enquiryId) => {
  try {
    await ServiceProviderEnquiry.update(
      {
        registration_link: null,
        registration_link_expires: null,
      },
      {
        where: { enquiry_id: enquiryId },
      }
    );
  } catch (error) {
    throw new Error("Failed to invalidate registration link");
  }
};

const generatePasswordLink = async (user) => {
  try {
    const tokenData = {
      uid: user.u_id,
      name: user.name,
      isValid: user.pw !== null,
      ts: Math.floor(Date.now() / 1000),
    };

    const randomBytes = crypto.randomBytes(8).toString("base64url");
    tokenData.n = randomBytes;

    const token = jwt.sign(
      tokenData,
      config.development.registration.secretKey,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const passwordLink = `${process.env.FRONTEND_URL}/login/provider/frist-login/${token}`;

    return passwordLink;
  } catch (error) {
    throw new Error("Failed to generate registration link");
  }
};

const generateEmailValidationLink = async (user) => {
  try {
    const tokenData = {
      uid: user.u_id,
      name: user.name,
      isValid: !user.email_verified,
      user_type: user.role,
      ts: Math.floor(Date.now() / 1000),
    };

    const randomBytes = crypto.randomBytes(8).toString("base64url");
    tokenData.n = randomBytes;

    const token = jwt.sign(
      tokenData,
      config.development.registration.secretKey,
      {
        expiresIn: "1d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const emailLink = `${process.env.FRONTEND_URL}/profile/customer/validate-email/${token}`;

    return emailLink;
  } catch (error) {
    throw new Error("Failed to generate Email ValidationLink");
  }
};

const generateRejectionLink = async (enquiry, reason) => {
  try {
    const tokenData = {
      eid: enquiry.enquiry_id,
      uid: enquiry.user_id,
      t: enquiry.business_type[0],
      rs: reason,
      ts: Math.floor(Date.now() / 1000),
    };

    const randomBytes = crypto.randomBytes(8).toString("base64url");
    tokenData.n = randomBytes;

    const token = jwt.sign(
      tokenData,
      config.development.registration.secretKey,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const rejectionLink = `${process.env.FRONTEND_URL}/service-provider/reject/${token}`;

    return rejectionLink;
  } catch (error) {
    throw new Error("Failed to generate registration link");
  }
};

module.exports = {
  generateRegistrationLink,
  validateRegistrationLink,
  invalidateRegistrationLink,
  generatePasswordLink,
  generateEmailValidationLink,
  generateRejectionLink,
};
