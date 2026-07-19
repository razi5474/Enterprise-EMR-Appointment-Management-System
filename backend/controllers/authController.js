const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const ApiResponse = require('../utils/apiResponse');

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

module.exports = { login };