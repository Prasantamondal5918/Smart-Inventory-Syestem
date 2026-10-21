const aiService = require('../services/ai.service');
const chatHistoryService = require('../services/chatHistory.service');
const Shop = require('../models/Shop');

/**
 * POST /api/ai/chat
 * Send a message and receive an AI business assistant response.
 * Requires: JWT auth (protect middleware already validated)
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const user = req.user;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
        data: null,
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep it under 1000 characters.',
        data: null,
      });
    }

    // Fetch shop name for context
    let shopName = 'Your Shop';
    try {
      const shop = await Shop.findById(user.shopId).select('shopName').lean();
      if (shop) shopName = shop.shopName;
    } catch {
      // Non-fatal: continue without shop name
    }

    // Resolve or create conversation
    const conversation = await chatHistoryService.getOrCreateConversation(
      user._id,
      user.shopId,
      conversationId || null
    );

    // Build history for the AI (only user/assistant turns, last 10)
    const historyMessages = conversation.messages
      .slice(-20) // last 20 messages = last 10 turns
      .map((m) => ({ role: m.role, content: m.content }));

    // Call AI service
    const { reply } = await aiService.chat({
      message: trimmedMessage,
      conversationHistory: historyMessages,
      user,
      shopName,
    });

    // Persist messages
    await chatHistoryService.appendMessages(
      conversation._id,
      user._id,
      user.shopId,
      trimmedMessage,
      reply
    );

    return res.status(200).json({
      success: true,
      message: 'AI response generated successfully.',
      data: {
        reply,
        conversationId: conversation._id,
        conversationTitle: conversation.title,
      },
    });
  } catch (error) {
    // Do not expose raw AI provider errors or internal details
    const isAIError =
      error.message.includes('OpenAI') ||
      error.message.includes('API key') ||
      error.status === 401 ||
      error.status === 429;

    if (isAIError) {
      return res.status(503).json({
        success: false,
        message:
          'The AI assistant is currently unavailable. Please check your API key configuration or try again later.',
        data: null,
      });
    }

    if (error.message.includes('Conversation not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    next(error);
  }
};

/**
 * GET /api/ai/conversations
 * List recent conversations for the authenticated user.
 */
exports.listConversations = async (req, res, next) => {
  try {
    const conversations = await chatHistoryService.listConversations(
      req.user._id,
      req.user.shopId
    );

    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved.',
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/conversations/:id
 * Load a specific conversation's messages (ownership verified).
 */
exports.getConversation = async (req, res, next) => {
  try {
    const conv = await chatHistoryService.getConversation(
      req.params.id,
      req.user._id,
      req.user.shopId
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation loaded.',
      data: {
        conversationId: conv._id,
        title: conv.title,
        messages: conv.messages,
        createdAt: conv.createdAt,
        lastActivityAt: conv.lastActivityAt,
      },
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

/**
 * DELETE /api/ai/conversations/:id
 * Delete a conversation (ownership verified).
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    await chatHistoryService.deleteConversation(
      req.params.id,
      req.user._id,
      req.user.shopId
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted.',
      data: null,
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

/**
 * PATCH /api/ai/conversations/:id/clear
 * Clear all messages in a conversation (ownership verified).
 */
exports.clearConversation = async (req, res, next) => {
  try {
    await chatHistoryService.clearConversation(
      req.params.id,
      req.user._id,
      req.user.shopId
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation cleared.',
      data: null,
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};
