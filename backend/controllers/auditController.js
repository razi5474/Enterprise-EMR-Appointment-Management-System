const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/apiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return ApiResponse.success(res, { statusCode: 200, message: 'Audit logs fetched successfully', data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };