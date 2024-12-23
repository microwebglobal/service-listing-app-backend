const OTP_STORE = {}; // To store OTPs temporarily

// Function to send OTP
const sendOTP = (req, res, next) => {
  const { mobile } = req.body;

  const generateOTP = () => {
    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };

  const otp = generateOTP();
  OTP_STORE[mobile] = otp;

  console.log(`OTP for ${mobile}: ${otp}`); // For testing
  res.json({ success: true, message: `OTP sent to ${mobile}` });
};

// Function to verify OTP
const verifyOTP = (req, res, next) => {
  const { mobile, otp } = req.body;

  if (OTP_STORE[mobile] === otp) {
    delete OTP_STORE[mobile];
    next();
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired OTP." });
  }
};

module.exports = { sendOTP, verifyOTP };
