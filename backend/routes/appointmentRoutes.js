const express = require('express');
const router = express.Router();
const { createAppointment } = require('../controllers/appointmentController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/', authenticate, authorize('receptionist', 'super_admin'), createAppointment);

module.exports = router;