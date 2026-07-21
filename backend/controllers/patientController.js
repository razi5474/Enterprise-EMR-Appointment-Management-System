const Patient = require('../models/Patient');
const ApiResponse = require('../utils/apiResponse');

const searchPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search || search.trim().length < 2) {
      return ApiResponse.success(res, { statusCode: 200, message: 'Provide at least 2 characters to search', data: [] });
    }

    const regex = new RegExp(search.trim(), 'i');
    const patients = await Patient.find({
      $or: [{ name: regex }, { mobile: regex }],
    }).limit(10);

    return ApiResponse.success(res, { statusCode: 200, message: 'Patients fetched successfully', data: patients });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchPatients };