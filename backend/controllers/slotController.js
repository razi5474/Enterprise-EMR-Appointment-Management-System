const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');
const ApiResponse = require('../utils/apiResponse');
const {
  generateSlotsForDay,
  getWeekday,
  isPastDate,
  isToday,
  timeToMinutes,
} = require('../services/slotService');

const getSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return ApiResponse.error(res, { statusCode: 400, message: 'doctorId and date are required' });
    }

    if (isPastDate(date)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Cannot fetch slots for a past date' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return ApiResponse.error(res, { statusCode: 404, message: 'Doctor not found' });
    }

    const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
    if (!schedule) {
      return ApiResponse.error(res, { statusCode: 404, message: 'No schedule configured for this doctor' });
    }

    const weekday = getWeekday(date);
    if (!schedule.workingDays.includes(weekday)) {
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Doctor does not work on this day',
        data: { date, slots: [] },
      });
    }

    let slots = generateSlotsForDay(schedule.sessions, schedule.slotDurationMinutes);

    // For today, filter out slots that have already passed
    if (isToday(date)) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      slots = slots.filter((slot) => timeToMinutes(slot) > nowMinutes);
    }

    // TODO: once Appointment model exists, mark each slot booked/available
    // by checking existing appointments for this doctor+date
    const slotData = slots.map((time) => ({ time, status: 'available' }));

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Slots fetched successfully',
      data: { date, doctorId, slots: slotData },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSlots };