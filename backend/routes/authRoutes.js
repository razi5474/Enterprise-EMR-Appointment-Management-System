const express = require('express');
const router = express.Router();
const { login, logout, refresh } = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;