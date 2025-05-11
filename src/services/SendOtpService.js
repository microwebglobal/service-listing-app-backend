const axios = require("axios");
const config = require("../config/config");

const sendOtpToUser = async (mobile, otp) => {
  const MSG91_AUTH_KEY = config.development.msg91.MSG91_AUTH_KEY;
  const TEMPLATE_ID = config.development.msg91.TEMPLATE_ID;
  const BASE_URL = config.development.msg91.BASE_URL;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        mobile: `${mobile}`,
        otp_expiry: 5,
        template_id: TEMPLATE_ID,
        authkey: MSG91_AUTH_KEY,
        otp,
        realTimeResponse: 1,
      },
    });

    console.log(response.data);
  } catch (error) {
    console.error("OTP Send Error:", error.response?.data || error.message);
  }
};

module.exports = sendOtpToUser;
