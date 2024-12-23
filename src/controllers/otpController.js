// controllers/otpController.js
const OTP_STORE = {}; // To store OTPs temporarily

class OTPController {
  // Function to send OTP
  static sendOTP(req, res, next) {
    const { mobile } = req.body;

    // Generate OTP function
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

    // Send response
    res.json({ success: true, message: `OTP sent to ${mobile}` });
  }

  // Function to verify OTP
  static verifyOTP(req, res) {
    const { mobile, otp } = req.body;
  
    if (OTP_STORE[mobile] === otp) {
      // OTP delete it from the store 
      delete OTP_STORE[mobile];
  
      // Respond with success
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully."
      });
    } else {
      // OTP is incorrect or expired
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP."
      });
    }
  }
}

module.exports = OTPController;
