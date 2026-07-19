const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Name, email, password, and role are required' });
    }

    if (!['doctor', 'receptionist'].includes(role)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Role must be doctor or receptionist' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, { statusCode: 409, message: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: `${role} created successfully`,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser };