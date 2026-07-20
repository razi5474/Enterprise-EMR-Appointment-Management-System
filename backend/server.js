require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const Appointment = require('./models/Appointment');
const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    await Appointment.syncIndexes();
    console.log('Appointment indexes synced');
  } catch (err) {
    console.error('Index sync failed:', err.message);
  }
});
// Core middleware
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/doctors', require('./routes/doctorRoutes'));
app.use('/api/v1/slots', require('./routes/slotRoutes'));
app.use('/api/v1/appointments', require('./routes/appointmentRoutes'));
app.use('/api/v1/audit-logs', require('./routes/auditRoutes'));

// Health check route — sanity check before building anything real
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', data: {}, meta: {} });
});

// Routes will get mounted here as you build them, e.g.:
// app.use('/api/v1/auth', require('./routes/authRoutes'));

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: {}, meta: {} });
});

// Centralized error handler — always last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));