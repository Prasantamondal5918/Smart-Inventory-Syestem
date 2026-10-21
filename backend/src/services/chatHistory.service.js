const Conversation = require('../models/Conversation');

/**
 * Find or create a conversation for a user.
 * If conversationId is provided, verifies ownership before returning it.
 */
const getOrCreateConversation = async (userId, shopId, conversationId) => {
  if (conversationId) {
    const existing = await Conversation.findOne({
      _id: conversationId,
      userId,
      shopId,
    });
    if (!existing) {
      throw new Error('Conversation not found or access denied.');
    }
    return existing;
  }

  // Create a new conversation
  const newConv = new Conversation({ userId, shopId });
  await newConv.save();
  return newConv;
};

/**
 * Append user and assistant messages to a conversation.
 */
const appendMessages = async (conversationId, userId, shopId, userMessage, assistantReply) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId, shopId });
  if (!conv) throw new Error('Conversation not found.');

  conv.messages.push({ role: 'user', content: userMessage });
  conv.messages.push({ role: 'assistant', content: assistantReply });

  // Auto-generate a title from the first user message
  if (conv.title === 'New Conversation' && conv.messages.length <= 2) {
    conv.title = userMessage.substring(0, 60) + (userMessage.length > 60 ? '...' : '');
  }

  conv.lastActivityAt = new Date();

  // Keep only the last 200 messages (100 turns)
  if (conv.messages.length > 200) {
    conv.messages = conv.messages.slice(-200);
  }

  await conv.save();
  return conv;
};

/**
 * List recent conversations for a user.
 */
const listConversations = async (userId, shopId, limit = 20) => {
  return Conversation.find({ userId, shopId })
    .select('_id title lastActivityAt createdAt')
    .sort({ lastActivityAt: -1 })
    .limit(Math.min(limit, 50))
    .lean();
};

/**
 * Get a full conversation with messages (verifies ownership).
 */
const getConversation = async (conversationId, userId, shopId) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId, shopId });
  if (!conv) throw new Error('Conversation not found or access denied.');
  return conv;
};

/**
 * Delete a conversation (verifies ownership).
 */
const deleteConversation = async (conversationId, userId, shopId) => {
  const result = await Conversation.deleteOne({ _id: conversationId, userId, shopId });
  if (result.deletedCount === 0) {
    throw new Error('Conversation not found or access denied.');
  }
};

/**
 * Clear all messages in a conversation (verifies ownership).
 */
const clearConversation = async (conversationId, userId, shopId) => {
  const conv = await Conversation.findOne({ _id: conversationId, userId, shopId });
  if (!conv) throw new Error('Conversation not found or access denied.');
  conv.messages = [];
  conv.title = 'New Conversation';
  conv.lastActivityAt = new Date();
  await conv.save();
  return conv;
};

module.exports = {
  getOrCreateConversation,
  appendMessages,
  listConversations,
  getConversation,
  deleteConversation,
  clearConversation,
};
