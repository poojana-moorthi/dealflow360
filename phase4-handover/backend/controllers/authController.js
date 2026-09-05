const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { generateToken } = require('../config/jwt');
const { logAudit } = require('../utils/auditLogger');

async function signup(req, res, next) {
  try {
    const { name, email, identifier, password, role = 'SALES_REP', customerId, phone } = req.body;
    const resolvedEmail = email || (identifier && identifier.includes('@') ? identifier : `${identifier || role.toLowerCase()}@dealflow360.com`);
    const cleanId = (identifier || '').toLowerCase();
    const resolvedName = name || (cleanId ? cleanId.replace(/_/g, ' ') : (role ? role.replace(/_/g, ' ') : 'User'));

    const existing = await User.findByIdentifier(resolvedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Account '${resolvedEmail}' is already registered.`
      });
    }

    let resolvedCustomerId = customerId;
    let companyName = 'Enterprise Partner';

    if (!resolvedCustomerId && role === 'CUSTOMER') {
      if (cleanId === 'customer1' || resolvedEmail.startsWith('customer1@')) {
        resolvedCustomerId = 1;
        companyName = 'Acme Corporation';
      } else if (cleanId === 'customer2' || resolvedEmail.startsWith('customer2@')) {
        resolvedCustomerId = 2;
        companyName = 'Nova Technologies';
      } else if (cleanId === 'customer3' || resolvedEmail.startsWith('customer3@')) {
        resolvedCustomerId = 3;
        companyName = 'TechCorp International';
      } else {
        // Create an independent new customer organization so the new account starts fresh
        const formattedCompany = cleanId 
          ? cleanId.charAt(0).toUpperCase() + cleanId.slice(1) + ' Inc.'
          : 'New Customer Enterprise';
        companyName = formattedCompany;
        resolvedCustomerId = await Customer.create({
          company_name: formattedCompany,
          contact_name: resolvedName,
          email: resolvedEmail,
          phone: phone || null,
          tier: 'BRONZE'
        });
      }
    } else if (resolvedCustomerId) {
      const existingCust = await Customer.findById(resolvedCustomerId);
      if (existingCust) companyName = existingCust.company_name;
    }

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);
    const userId = await User.create({
      name: resolvedName,
      email: resolvedEmail,
      passwordHash,
      role,
      customerId: resolvedCustomerId,
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
          customerId: user.customer_id,
          companyName: companyName
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
