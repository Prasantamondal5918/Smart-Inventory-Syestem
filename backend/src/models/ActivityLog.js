const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      default: null,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    quantity: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
