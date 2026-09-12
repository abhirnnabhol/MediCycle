const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please sign in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'medicycle_super_secret_jwt_key_hackathon_2025'
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or deactivated. Please contact platform administration.',
      });
    }

    user.lastActiveAt = new Date();
    if (typeof user.save === 'function') {
      user.save().catch(() => {});
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      if (roles.length === 1 && roles[0] === 'pharmacist' && req.user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Clinical safety governance: Platform Administrators cannot perform clinical inspections, verify medicines, or dispense prescriptions. This clinical authority is restricted exclusively to licensed pharmacists.',
        });
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to perform this operation. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

const requireAdmin = authorize('admin');
const requirePharmacist = authorize('pharmacist');
const requirePharmacistOrAdmin = authorize('pharmacist', 'admin');
const requireUser = authorize('user', 'pharmacist', 'admin');

module.exports = { 
  protect, 
  authorize,
  requireAdmin,
  requirePharmacist,
  requirePharmacistOrAdmin,
  requireUser
};
