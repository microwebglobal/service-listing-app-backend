require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    registration: {
      secretKey: process.env.REGISTRATION_SECRET_KEY || "your-secret-key",
      expiryDays: 7,
    },
    phonePe: {
      clientId: process.env.PHONEPE_CLIENT_ID,
      clientSecret: process.env.PHONEPE_CLIENT_SECRET,
    },
    msg91: {
      MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
      TEMPLATE_ID: process.env.TEMPLATE_ID,
      BASE_URL: process.env.BASE_URL,
      VERIFY_URL: process.env.VERIFY_URL,
    },
    whatsApp: {
      WHATSAPP_AUTH_TOKEN: process.env.WHATSAPP_AUTH_TOKEN,
      WHATSAPP_MOBILE_ID: process.env.WHATSAPP_MOBILE_ID,
    },
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
  test: {
    // Test configuration
  },
  production: {
    // Production configuration
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
