const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/', authenticate, authorize('super_admin'), createUser);

module.exports = router;