const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    supplier: {
      type: String,
      default: 'General Supplier',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    batchNumber: {
      type: String,
      default: '',
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockSchema.index({ shopId: 1, productId: 1 });

module.exports = mongoose.model('Stock', stockSchema);
