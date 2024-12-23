const jwt = require('jsonwebtoken');

require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authorization token is missing' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Error:', err.message);
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = user; 
    next();
  });
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const hasRole = roles.some(role => req.user.role === role);
    if (!hasRole) {
      return res.status(403).json({ message: 'You do not have the required permissions' });
    }

    next(); 
  };
};

module.exports = {
  verifyToken,
  checkRole
};
