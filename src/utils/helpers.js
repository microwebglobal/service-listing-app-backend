const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

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
      config.registration.secretKey,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const registrationLink = `${baseUrl}/service-provider/register/${token}`;

    return registrationLink;
  } catch (error) {
    throw new Error("Failed to generate registration link");
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
      config.registration.secretKey,
      {
        expiresIn: "7d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const passwordLink = `${baseUrl}/login/provider/frist-login/${token}`;

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
      config.registration.secretKey,
      {
        expiresIn: "1d",
        algorithm: "HS256",
        noTimestamp: true,
      }
    );

    const emailLink = `${baseUrl}/profile/customer/validate-email/${token}`;

    return emailLink;
  } catch (error) {
    throw new Error("Failed to generate Email ValidationLink");
  }
};

module.exports = {
  generateRegistrationLink,
  validateRegistrationLink,
  invalidateRegistrationLink,
  generatePasswordLink,
  generateEmailValidationLink,
};