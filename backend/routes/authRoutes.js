const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.post('/login', login);
router.get('/test-protected', authenticate, authorize('super_admin'), (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.role}, you are authorized.` });
});

module.exports = router;