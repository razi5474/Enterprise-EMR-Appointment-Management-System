const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const ApiResponse = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const logAction = require('../utils/auditLogger');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Email and password are required' });
    }

    // password has select:false in the model, so explicitly request it here
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return ApiResponse.error(res, { statusCode: 401, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, { statusCode: 401, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist the refresh token so logout/refresh can validate it server-side
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });

    await logAction({ userId: user._id, role: user.role, action: 'LOGIN', entity: 'User', entityId: user._id });

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err); // hands off to your centralized errorHandler
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Refresh token is required' });
    }

    // 1. Is it a valid, unexpired JWT?
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return ApiResponse.error(res, { statusCode: 401, message: 'Invalid or expired refresh token' });
    }

    // 2. Does it still exist in our DB? (not logged out / revoked)
    const storedToken = await RefreshToken.findOne({ token: refreshToken, user: decoded.id });
    if (!storedToken) {
      return ApiResponse.error(res, { statusCode: 401, message: 'Refresh token not recognized' });
    }

    // 3. Issue a fresh access token
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return ApiResponse.error(res, { statusCode: 401, message: 'User not found or inactive' });
    }

    const newAccessToken = generateAccessToken(user);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Access token refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Refresh token is required' });
    }

    // Delete it from DB — this is the actual "invalidation"
    await RefreshToken.deleteOne({ token: refreshToken });

    return ApiResponse.success(res, { statusCode: 200, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout };