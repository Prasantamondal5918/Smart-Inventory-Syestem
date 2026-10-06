const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['owner', 'worker'],
      default: 'worker',
    },
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    designation: {
      type: String,
      default: 'Staff',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    workerId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ shopId: 1, role: 1 });
userSchema.index({ workerId: 1 });

module.exports = mongoose.model('User', userSchema);
