const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },    // "12:00"
  },
  { _id: false }
);

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      unique: true, // one schedule document per doctor
    },
    workingDays: {
      type: [String], // e.g. ["monday", "tuesday", "wednesday", "thursday", "friday"]
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    sessions: {
      type: [sessionSchema], // e.g. [{startTime:"09:00", endTime:"12:00"}, {startTime:"13:00", endTime:"17:00"}]
      required: true,
    },
    slotDurationMinutes: {
      type: Number,
      required: true,
      default: 15,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);