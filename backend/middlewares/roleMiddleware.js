const ApiResponse = require('../utils/apiResponse');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, { statusCode: 403, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = authorize;