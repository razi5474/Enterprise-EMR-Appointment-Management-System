const express = require('express');
const router = express.Router();
const { getSlots } = require('../controllers/slotController');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, getSlots);

module.exports = router;