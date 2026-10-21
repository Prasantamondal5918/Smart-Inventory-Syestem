const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 8000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      maxlength: 100,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
      validate: {
        validator: (msgs) => msgs.length <= 200,
        message: 'Conversation has too many messages.',
      },
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, shopId: 1, lastActivityAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
