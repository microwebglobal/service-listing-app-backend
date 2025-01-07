const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Generates a secure registration link for service provider registration
 * @param {Object} enquiry - The service provider enquiry object
 * @returns {Promise<string>} The generated registration link
 */
const generateRegistrationLink = async (enquiry) => {
  try {
    // Generate a unique token using enquiry data
    const tokenData = {
      enquiry_id: enquiry.enquiry_id,
      user_id: enquiry.user_id,
      business_type: enquiry.business_type,
      timestamp: Date.now(),
    };

    // Add a random component for additional security
    const randomBytes = crypto.randomBytes(16).toString("hex");
    tokenData.nonce = randomBytes;

    // Sign the token with expiration (7 days)
    const token = jwt.sign(tokenData, config.registration.secretKey, {
      expiresIn: "7d",
    });

    // Create the registration link
    const registrationLink = `${config.baseUrl}/service-provider/register/${token}`;

    return registrationLink;
  } catch (error) {
    console.error("Error generating registration link:", error);
    throw new Error("Failed to generate registration link");
  }
};

/**
 * Validates a registration link token
 * @param {string} token - The registration link token
 * @returns {Promise<Object>} The decoded token data
 */
const validateRegistrationLink = async (token) => {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, config.registration.secretKey);

    // Check if the enquiry still exists and is still valid
    const enquiry = await ServiceProviderEnquiry.findOne({
      where: {
        enquiry_id: decoded.enquiry_id,
        status: "approved",
        registration_link_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!enquiry) {
      throw new Error("Invalid or expired registration link");
    }

    // Check if the provider is already registered
    const existingProvider = await ServiceProvider.findOne({
      where: { user_id: decoded.user_id },
    });

    if (existingProvider) {
      throw new Error("Service provider already registered");
    }

    return decoded;
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

/**
 * Invalidates a registration link after successful registration
 * @param {number} enquiryId - The enquiry ID
 * @returns {Promise<void>}
 */
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
    console.error("Error invalidating registration link:", error);
    throw new Error("Failed to invalidate registration link");
  }
};

module.exports = {
  generateRegistrationLink,
  validateRegistrationLink,
  invalidateRegistrationLink,
};
