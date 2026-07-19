const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, { statusCode: 401, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return ApiResponse.error(res, { statusCode: 401, message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;