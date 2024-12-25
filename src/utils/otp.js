const crypto = require('crypto');

class OTPHandler {
  constructor() {
    this.otpStore = new Map();
    setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
  }

  generateOTP() {
    return crypto.randomInt(1000, 10000).toString().padStart(4, '0');
  }

  async sendOTP(mobile) {  // Modified to accept mobile directly
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      throw new Error("Invalid mobile number format");
    }

    // Check if there's an existing non-expired OTP
    const existing = this.otpStore.get(mobile);
    if (existing && Date.now() < existing.expiresAt) {
      const waitTime = Math.ceil((existing.expiresAt - Date.now()) / 1000);
      throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
    }

    const otp = this.generateOTP();
    
    // Store OTP with 5-minute expiration
    this.otpStore.set(mobile, {
      otp: otp,
      expiresAt: Date.now() + (5 * 60 * 1000),
      attempts: 0
    });

    // In production, integrate with SMS service
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV ONLY] OTP for ${mobile}: ${otp}`);
    }

    return otp;
  }

  verifyOTP(mobile, otp) {  // Modified to be a utility function
    const storedData = this.otpStore.get(mobile);

    if (!storedData) {
      throw new Error("No OTP found for this number. Please request a new OTP");
    }

    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(mobile);
      throw new Error("OTP has expired. Please request a new one");
    }

    storedData.attempts += 1;

    if (storedData.attempts >= 3) {
      this.otpStore.delete(mobile);
      throw new Error("Too many failed attempts. Please request a new OTP");
    }

    if (storedData.otp !== otp) {
      throw new Error(`Invalid OTP. ${3 - storedData.attempts} attempts remaining`);
    }

    // OTP verified successfully
    this.otpStore.delete(mobile);
    return true;
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [mobile, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(mobile);
      }
    }
  }
}

module.exports = new OTPHandler();