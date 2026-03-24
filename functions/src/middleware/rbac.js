const { ROLES } = require('../config/constants');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

const authorizeOwnerOrAdmin = (resourceUserField = 'applicant') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const resource = req.resource;
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    const isOwner = resource[resourceUserField]?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };
