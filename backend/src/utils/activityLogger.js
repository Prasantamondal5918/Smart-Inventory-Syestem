const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, shopId, branchId = null, action, productId = null, quantity = null, description, req = null }) => {
  try {
    let ipAddress = '127.0.0.1';
    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
    }
    const now = new Date();
    await ActivityLog.create({
      userId,
      shopId,
      branchId,
      action,
      productId,
      quantity,
      description,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString(),
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to record activity log:', error.message);
  }
};

module.exports = logActivity;
