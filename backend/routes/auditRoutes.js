const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const authenticate = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

router.get('/', authenticate, authorize('super_admin'), getAuditLogs);

module.exports = router;