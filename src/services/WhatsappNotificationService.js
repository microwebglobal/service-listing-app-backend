const axios = require("axios");

const sendWhatsappOtp = async (toPhoneNumber, otpCode) => {
  try {
    const url =
      "https://graph.facebook.com/v18.0/META_PHONE_NUMBER_ID/messages";
    const data = {
      messaging_product: "whatsapp",
      to: toPhoneNumber,
      type: "template",
      template: {
        name: "otp_template",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otpCode }],
          },
        ],
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer META_ACCESS_TOKEN`,
        "Content-Type": "application/json",
      },
    });

    console.log("WhatsApp message sent:", response.data);
  } catch (err) {
    console.error("WhatsApp send error:", err.response?.data || err.message);
  }
};

module.exports = sendWhatsappOtp;
