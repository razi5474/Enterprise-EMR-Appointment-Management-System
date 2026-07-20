const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
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

const createAppointment = async (req, res, next) => {
  try {
    const { patientId, newPatient, doctorId, date, slotTime, purpose } = req.body;

    if (!doctorId || !date || !slotTime) {
      return ApiResponse.error(res, { statusCode: 400, message: 'doctorId, date, and slotTime are required' });
    }

    if (!patientId && !newPatient) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Provide either patientId or newPatient details' });
    }

    // 1. Re-validate the slot is actually legitimate for this doctor/date/time
    if (isPastDate(date)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Cannot book a past date' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return ApiResponse.error(res, { statusCode: 404, message: 'Doctor not found' });
    }

    const schedule = await DoctorSchedule.findOne({ doctor: doctorId });
    if (!schedule || !schedule.workingDays.includes(getWeekday(date))) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Doctor does not work on this day' });
    }

    const validSlots = generateSlotsForDay(schedule.sessions, schedule.slotDurationMinutes);
    if (!validSlots.includes(slotTime)) {
      return ApiResponse.error(res, { statusCode: 400, message: 'Invalid slot time for this doctor\'s schedule' });
    }

    if (isToday(date)) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      if (timeToMinutes(slotTime) <= nowMinutes) {
        return ApiResponse.error(res, { statusCode: 400, message: 'Cannot book a past time slot' });
      }
    }

    // 2. Resolve the patient — existing or newly created
    let resolvedPatientId = patientId;
    if (!resolvedPatientId && newPatient) {
      const { name, mobile, email, age, gender } = newPatient;
      if (!name || !mobile) {
        return ApiResponse.error(res, { statusCode: 400, message: 'New patient requires at least name and mobile' });
      }
      const createdPatient = await Patient.create({ name, mobile, email, age, gender });
      resolvedPatientId = createdPatient._id;
    }

    // 3. Attempt the booking — MongoDB's unique index is what actually prevents double-booking
    try {
      const appointment = await Appointment.create({
        patient: resolvedPatientId,
        doctor: doctorId,
        department: doctor.department,
        date,
        slotTime,
        purpose,
        createdBy: req.user.id,
      });

      // TODO: emit socket event here once Socket.IO is wired up
      // TODO: write audit log entry here

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Appointment booked successfully',
        data: appointment,
      });
    } catch (err) {
      // MongoDB duplicate-key error = someone else booked this exact slot first
      if (err.code === 11000) {
        return ApiResponse.error(res, {
          statusCode: 409,
          message: 'This slot has just been booked by someone else. Please choose another slot.',
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { createAppointment };