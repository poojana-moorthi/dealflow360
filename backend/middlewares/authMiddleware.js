const { verifyToken } = require('../config/jwt');
const { query } = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    const users = await query(
      'SELECT id, name, email, role, customer_id, phone, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users || users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user account or user deactivated'
      });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token expired or invalid',
      error: err.message
    });
  }
}

module.exports = { authenticateToken };
