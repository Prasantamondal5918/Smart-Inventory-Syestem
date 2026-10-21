const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

// Rate limiting: 20 AI requests per minute per IP
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'Too many requests to the AI assistant. Please wait a moment and try again.',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI routes require authentication
router.use(protect);
router.use(aiRateLimit);

// Chat endpoint
router.post('/chat', aiController.chat);

// Conversation management
router.get('/conversations', aiController.listConversations);
router.get('/conversations/:id', aiController.getConversation);
router.delete('/conversations/:id', aiController.deleteConversation);
router.patch('/conversations/:id/clear', aiController.clearConversation);

module.exports = router;
