const axios = require("axios");
const config = require("../config/config");

const sendOtpToUser = async (mobile, otp) => {
  const MSG91_AUTH_KEY = config.development.msg91.MSG91_AUTH_KEY;
  const VERIFY_URL = config.development.msg91.VERIFY_URL;

  try {
    const response = await axios.get(VERIFY_URL, {
      params: {
        mobile: `${mobile}`,
        otp,
        authkey: MSG91_AUTH_KEY,
      },
    });

    return response.data.type === "success";
  } catch (error) {
    console.error("OTP Verify Error:", error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendOtpToUser };
