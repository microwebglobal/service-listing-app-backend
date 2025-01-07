require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    registration: {
      secretKey: process.env.REGISTRATION_SECRET_KEY || 'your-secret-key',
      expiryDays: 7
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
