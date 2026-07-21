const express = require('express');
const router = express.Router();
const { searchPatients } = require('../controllers/patientController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, searchPatients);

module.exports = router;