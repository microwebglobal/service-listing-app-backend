const axios = require("axios");
const config = require("../config/config");

const sendWhatsappOtp = async (toPhoneNumber, otpCode) => {
  try {
    const url = "https://graph.facebook.com/v22.0/574664722406969/messages";
    const data = {
      messaging_product: "whatsapp",
      to: toPhoneNumber,
      type: "template",
      template: {
        name: "booking_auth",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otpCode,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: "https://exa",
              },
            ],
          },
        ],
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: config.development.whatsApp.WHATSAPP_AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    });

    console.log("WhatsApp message sent:", response.data);
  } catch (err) {
    console.error("WhatsApp send error:", err.response?.data || err.message);
  }
};

module.exports = sendWhatsappOtp;
