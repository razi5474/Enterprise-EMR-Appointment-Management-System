const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');
const ApiResponse = require('../utils/apiResponse');

// GET /api/v1/doctors — required by spec, used for filters/dropdowns
const listDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email').lean();
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Doctors fetched successfully',
      data: doctors,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/doctors/:doctorId/schedule — Super Admin only
const setSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { workingDays, sessions, slotDurationMinutes } = req.body;

    if (!workingDays?.length || !sessions?.length || !slotDurationMinutes) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: 'workingDays, sessions, and slotDurationMinutes are required',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return ApiResponse.error(res, { statusCode: 404, message: 'Doctor not found' });
    }

    // upsert: create schedule if none exists yet, otherwise update it
    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctor: doctorId },
      { doctor: doctorId, workingDays, sessions, slotDurationMinutes },
      { new: true, upsert: true, runValidators: true }
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Schedule saved successfully',
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listDoctors, setSchedule };