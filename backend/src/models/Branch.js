const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    branchId: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.index({ shopId: 1, branchId: 1 });

module.exports = mongoose.model('Branch', branchSchema);
