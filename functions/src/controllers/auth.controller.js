const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AUDIT_ACTIONS } = require('../config/constants');
const auditService = require('../services/auditService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization, inspectorCode } = req.body;

    // Only 'applicant' and 'inspector' can self-register.
    // Admin accounts must be created by an existing admin (via a separate admin-only route).
    const requestedRole = req.body.role;
    const SELF_REGISTER_ROLES = ['applicant', 'inspector'];
    const role = SELF_REGISTER_ROLES.includes(requestedRole) ? requestedRole : 'applicant';

    // Inspector self-registration requires a valid department authorization code.
    if (role === 'inspector') {
      const validCode = process.env.INSPECTOR_INVITE_CODE;
      if (!validCode) {
        return res.status(403).json({
          success: false,
          message: 'Inspector self-registration is currently disabled. Contact your administrator.',
        });
      }
      if (!inspectorCode || inspectorCode.trim() !== validCode.trim()) {
        return res.status(403).json({
          success: false,
          message: 'Invalid department authorization code. Contact your fire department administrator.',
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role, phone, organization });

    await auditService.log({
      action: AUDIT_ACTIONS.CREATE,
      performedBy: user._id,
      resourceType: 'User',
      resourceId: user._id,
      details: { name, email, role },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await auditService.log({
      action: AUDIT_ACTIONS.LOGIN,
      performedBy: user._id,
      resourceType: 'User',
      resourceId: user._id,
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const token = generateToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, organization } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, organization },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, getUsers };
