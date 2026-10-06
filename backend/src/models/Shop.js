const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    gstNumber: {
      type: String,
      trim: true,
      default: '',
    },
    businessType: {
      type: String,
      required: true,
      default: 'Retail',
    },
    branchCount: {
      type: Number,
      default: 1,
    },
    logo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.index({ owner: 1 });

module.exports = mongoose.model('Shop', shopSchema);
