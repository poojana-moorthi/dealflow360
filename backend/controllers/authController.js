const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { logAudit } = require('../utils/auditLogger');

async function signup(req, res, next) {
  try {
    const { name, email, identifier, password, role = 'SALES_REP', customerId, phone } = req.body;
    const resolvedEmail = email || (identifier && identifier.includes('@') ? identifier : `${identifier || role.toLowerCase()}@dealflow360.com`);
    const resolvedName = name || (role ? role.replace(/_/g, ' ') : 'User');

    const existing = await User.findByIdentifier(resolvedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Account '${resolvedEmail}' is already registered.`
      });
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);
    const userId = await User.create({
      name: resolvedName,
      email: resolvedEmail,
      passwordHash,
      role,
      customerId: customerId || (role === 'CUSTOMER' ? 1 : null),
      phone: phone || null
    });

    const user = await User.findById(userId);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await logAudit({
      user_id: user.id,
      role: user.role,
      action: 'SIGNUP',
      entity: 'USER',
      entity_id: user.id,
      reason: 'User account created autonomously'
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customer_id
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, identifier, password } = req.body;
    const searchKey = (email || identifier || '').trim();

    if (!searchKey || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password are required'
      });
    }

    const user = await User.findByIdentifier(searchKey);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials: User '${searchKey}' not found`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password incorrect'
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await logAudit({
      user_id: user.id,
      role: user.role,
      action: 'LOGIN',
      entity: 'USER',
      entity_id: user.id,
      reason: 'User logged in successfully'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customer_id,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    res.json({
      success: true,
      message: 'Current user fetched',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAudit({
        user_id: req.user.id,
        role: req.user.role,
        action: 'LOGOUT',
        entity: 'USER',
        entity_id: req.user.id,
        reason: 'User logged out'
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email, identifier, newPassword } = req.body;
    const searchVal = (email || identifier || '').trim();

    if (!searchVal) {
      return res.status(400).json({
        success: false,
        message: 'Email or role identifier is required for password recovery'
      });
    }

    const user = await User.findByIdentifier(searchVal);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account registered with identifier '${searchVal}'`
      });
    }

    const targetPassword = newPassword && newPassword.length >= 6 ? newPassword : 'Password123!';
    const passwordHash = await bcrypt.hash(targetPassword, 10);
    await User.updatePassword(user.id, passwordHash);

    await logAudit({
      user_id: user.id,
      role: user.role,
      action: 'PASSWORD_RESET',
      entity: 'USER',
      entity_id: user.id,
      reason: 'Password reset completed'
    });

    res.json({
      success: true,
      message: newPassword 
        ? `Password updated successfully for ${user.role} (${user.email}). You may now sign in.`
        : `Security reset successful for ${user.role} (${user.email}). Temporary password is 'Password123!'.`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getCurrentUser,
  logout,
  forgotPassword
};
