const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');
const ApiResponse = require('../utils/apiResponse');
const Appointment = require('../models/Appointment');
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

    // Find existing non-cancelled appointments for this doctor+date,
    // so we can mark which generated slots are actually booked.
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['scheduled', 'arrived', 'completed'] },
    }).select('slotTime');

    const bookedTimes = new Set(bookedAppointments.map((a) => a.slotTime));

    const slotData = slots.map((time) => ({
      time,
      status: bookedTimes.has(time) ? 'booked' : 'available',
    }));

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