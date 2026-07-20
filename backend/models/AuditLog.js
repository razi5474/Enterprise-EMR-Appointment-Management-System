const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "LOGIN", "APPOINTMENT_CREATED"
    entity: { type: String }, // e.g. "Appointment", appointment's _id
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true } // gives us the Timestamp field the spec asks for, for free
);

module.exports = mongoose.model('AuditLog', auditLogSchema);