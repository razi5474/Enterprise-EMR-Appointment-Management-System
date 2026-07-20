const express = require('express');
const router = express.Router();
const { listDoctors, setSchedule } = require('../controllers/doctorController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.get('/', authenticate, listDoctors); // any logged-in role can view doctors
router.post('/:doctorId/schedule', authenticate, authorize('super_admin'), setSchedule);

module.exports = router;