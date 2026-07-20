const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    department: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    slotTime: { type: String, required: true }, // "09:00"
    status: {
      type: String,
      enum: ['scheduled', 'arrived', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    purpose: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// THE concurrency-safety mechanism: MongoDB will reject a second insert
// with the same (doctor, date, slotTime) combo, atomically, no race condition possible.
appointmentSchema.index(
  { doctor: 1, date: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['scheduled', 'arrived', 'completed'] } },
  }
);

// Speeds up the common list queries: filter by doctor+date, or by status
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);