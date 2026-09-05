const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dealflow360_super_secret_jwt_key_2026!';
const JWT_EXPIRES_IN = '24h';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateToken,
  verifyToken
};
