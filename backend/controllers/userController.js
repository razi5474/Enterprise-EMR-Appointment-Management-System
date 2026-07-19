const User = require('../models/User');
const Doctor = require('../models/Doctor');
const ApiResponse = require('../utils/apiResponse');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Name, email, password, and role are required' });
    }

    if (!['doctor', 'receptionist'].includes(role)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Role must be doctor or receptionist' });
    }

    if (role === 'doctor' && !department) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Department is required for doctor accounts' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, { statusCode: 409, message: 'A user with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });

    let doctorProfile = null;
    if (role === 'doctor') {
      doctorProfile = await Doctor.create({ user: user._id, department, specialization });
    }

    return ApiResponse.success(res, {
      statusCode: 201,
      message: `${role} created successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(doctorProfile && { doctorProfile: { id: doctorProfile._id, department, specialization } }),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser };