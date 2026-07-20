const AuditLog = require('../models/AuditLog');

const logAction = async ({ userId, role, action, entity, entityId }) => {
  try {
    await AuditLog.create({ user: userId, role, action, entity, entityId });
  } catch (err) {
    // Never let audit logging break the actual request — just log the failure server-side
    console.error('Audit log failed:', err.message);
  }
};

module.exports = logAction;