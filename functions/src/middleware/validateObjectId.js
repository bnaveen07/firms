const mongoose = require('mongoose');

/**
 * Middleware that validates MongoDB ObjectId route parameters.
 * Usage: router.get('/:id', validateObjectId('id'), handler)
 */
const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      const value = req.params[param];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ID format for parameter '${param}'`,
        });
      }
    }
    next();
  };
};

module.exports = { validateObjectId };
