const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const log = async ({ action, performedBy, resourceType, resourceId, details, ipAddress, userAgent }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    logger.error(`Audit log error: ${error.message}`);
  }
};

const getAuditLogs = async (filter = {}, page = 1, limit = 20) => {
  const logs = await AuditLog.find(filter)
    .populate('performedBy', 'name email role')
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ timestamp: -1 });

  const total = await AuditLog.countDocuments(filter);
  return { logs, total, pages: Math.ceil(total / limit) };
};

module.exports = { log, getAuditLogs };
