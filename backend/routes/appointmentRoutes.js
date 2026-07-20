const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment,
  markArrived,
} = require('../controllers/appointmentController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/', authenticate, authorize('receptionist', 'super_admin'), createAppointment);
router.get('/', authenticate, getAppointments); // all roles, filtered by RBAC inside controller
router.put('/:id', authenticate, authorize('receptionist', 'super_admin', 'doctor'), updateAppointment);
router.delete('/:id', authenticate, authorize('receptionist', 'super_admin'), cancelAppointment);
router.post('/:id/arrive', authenticate, authorize('receptionist', 'super_admin'), markArrived);

module.exports = router;