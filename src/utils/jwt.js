const jwt = require('jsonwebtoken');

const jwtUtils = {
  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.u_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.u_id,
        tokenVersion: user.tokenVersion || 0
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      }
    );
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }
};

module.exports = jwtUtils;