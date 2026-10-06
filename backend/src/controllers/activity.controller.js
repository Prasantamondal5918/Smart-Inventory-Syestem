const ActivityLog = require('../models/ActivityLog');

// GET /api/activity-logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { workerId, action, startDate, endDate } = req.query;

    const query = { shopId: req.user.shopId };

    if (workerId) {
      query.userId = workerId;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const eod = new Date(endDate);
        eod.setHours(23, 59, 59, 999);
        query.createdAt.$lte = eod;
      }
    }

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('userId', 'name role email workerId designation')
      .populate('productId', 'productName image barcode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: {
        logs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
