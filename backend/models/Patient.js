const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
  },
  { timestamps: true }
);

// Speeds up search-by-mobile and search-by-name (spec explicitly requires these)
patientSchema.index({ mobile: 1 });
patientSchema.index({ name: 'text' });

module.exports = mongoose.model('Patient', patientSchema);