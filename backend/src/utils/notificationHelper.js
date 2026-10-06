const Notification = require('../models/Notification');

const createNotification = async ({ shopId, branchId = null, type, title, message }) => {
  try {
    await Notification.create({
      shopId,
      branchId,
      type,
      title,
      message,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = createNotification;
