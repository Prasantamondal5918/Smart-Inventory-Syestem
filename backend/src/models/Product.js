const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
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
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General',
    },
    brand: {
      type: String,
      trim: true,
      default: 'Generic',
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: 'pcs',
    },
    minimumStock: {
      type: Number,
      default: 5,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ shopId: 1, barcode: 1 });
productSchema.index({ shopId: 1, productName: 'text', category: 'text', brand: 'text' });
productSchema.index({ shopId: 1, branchId: 1 });

module.exports = mongoose.model('Product', productSchema);
