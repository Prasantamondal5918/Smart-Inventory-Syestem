import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/formatters';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
  Trash2,
  MessageSquarePlus,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Clock,
  X,
  History,
} from 'lucide-react';

// ─── Suggested Questions ─────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, text: 'How can I improve my business?', color: 'text-indigo-400' },
  { icon: ShoppingCart, text: 'Which products are selling the most?', color: 'text-emerald-400' },
  { icon: Package, text: 'What should I restock today?', color: 'text-amber-400' },
  { icon: BarChart3, text: "Compare this month's sales with last month", color: 'text-purple-400' },
  { icon: AlertTriangle, text: 'Which products may go out of stock soon?', color: 'text-rose-400' },
  { icon: Clock, text: 'Which products are not selling well?', color: 'text-cyan-400' },
  { icon: TrendingUp, text: 'Summarize my business performance this week', color: 'text-indigo-400' },
  { icon: BarChart3, text: 'Which products have low profit margins?', color: 'text-emerald-400' },
];

// ─── Inline Formatter ─────────────────────────────────────────────────────────
const inlineFormat = (text) => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-200 italic">$1</em>')
    .replace(
      /`(.+?)`/g,
      '<code class="bg-slate-800 text-indigo-300 px-1 rounded text-xs font-mono">$1</code>'
    );
};

// ─── Markdown Renderer ────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-white mt-3 mb-1">
          {line.replace(/^# /, '')}
        </h2>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-indigo-300 mt-2 mb-1">
          {line.replace(/^## /, '')}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-slate-200 mt-2 mb-1">
          {line.replace(/^### /, '')}
        </h4>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-none space-y-1 my-2 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      const listItems = [];
      let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push({ num, text: lines[i].replace(/^\d+\. /, '') });
        num++;
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1 my-2 pl-1">
          {listItems.map((item) => (
            <li key={item.num} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="text-indigo-400 font-bold flex-shrink-0 min-w-[1.25rem]">{item.num}.</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item.text) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={i} className="border-slate-700 my-3" />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
        </p>
      );
    }
    i++;
  }
  return elements;
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
            : 'bg-slate-800 border border-slate-700 rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="space-y-1">{renderMarkdown(msg.content)}</div>
        )}
        {msg.timestamp && (
          <p className={`text-[10px] mt-2 ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
            {new Date(msg.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-3 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
      <div className="flex items-center gap-1.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-1">Analyzing your business data...</span>
      </div>
    </div>
  </div>
);

// ─── Main Chatbot Page ────────────────────────────────────────────────────────
const AIChatbot = () => {
  const { user } = useAuthStore();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const loadConversations = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get('/ai/conversations');
      setConversations(res.data.conversations || []);
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showHistory) loadConversations();
  }, [showHistory, loadConversations]);

  const loadConversation = async (convId) => {
    try {
      const res = await API.get(`/ai/conversations/${convId}`);
      const conv = res.data;
      setMessages(
        (conv.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt,
        }))
      );
      setConversationId(conv.conversationId);
      setError(null);
      setShowHistory(false);
    } catch (err) {
      setError(err.message || 'Failed to load conversation.');
    }
  };

  const sendMessage = async (messageText) => {
    const text = (messageText !== undefined ? messageText : inputValue).trim();
    if (!text || isLoading) return;

    setInputValue('');
    setError(null);

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const payload = { message: text };
      if (conversationId) payload.conversationId = conversationId;

      const res = await API.post('/ai/chat', payload);
      const { reply, conversationId: convId } = res.data;

      if (!conversationId) setConversationId(convId);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
      setInputValue(text);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearChat = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    try {
      await API.patch(`/ai/conversations/${conversationId}/clear`);
      setMessages([]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to clear chat.');
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/ai/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (convId === conversationId) startNewChat();
    } catch (err) {
      setError(err.message || 'Failed to delete conversation.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4 relative">
      {/* History Sidebar */}
      {showHistory && (
        <div className="hidden lg:flex flex-col w-72 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Chat History
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Close history"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={startNewChat}
            className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New Conversation
          </button>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`group flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    conv._id === conversationId
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate">{conv.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatDate(conv.lastActivityAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all flex-shrink-0"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Panel */}
      <div className="flex flex-col flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">AI Business Assistant</h1>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Powered by real store data · Read-only analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory((prev) => !prev)}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                showHistory
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              aria-label="Toggle chat history"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-all"
              aria-label="New chat"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4" id="chat-messages">
          {/* Welcome State */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Hi, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mb-8">
                I'm your AI Business Assistant. Ask me anything about your sales, inventory, or
                business performance — I'll analyze your real store data to give you accurate
                insights.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {SUGGESTED_QUESTIONS.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.text)}
                      disabled={isLoading}
                      className="flex items-start gap-2.5 px-3.5 py-3 bg-slate-800 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-xl text-left transition-all group hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon className={`w-4 h-4 ${q.color} mt-0.5 flex-shrink-0`} />
                      <span className="text-xs text-slate-300 group-hover:text-white leading-snug">
                        {q.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-600 mt-6">
                💡 Chat history is stored securely and accessible only to you
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className={`mb-4 rounded-xl border overflow-hidden ${
              error.toLowerCase().includes('unavailable') || error.toLowerCase().includes('api key')
                ? 'bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-rose-500/10 border-rose-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="flex items-start gap-3 p-3.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rose-300">{error}</p>
                  {(error.toLowerCase().includes('unavailable') || error.toLowerCase().includes('api key')) && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-400">To fix this, configure your OpenAI API key:</p>
                      <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">backend/.env</span>
                        </div>
                        <code className="text-xs text-emerald-400 font-mono">
                          OPENAI_API_KEY=sk-your-api-key-here
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Get your API key from{' '}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                        >
                          platform.openai.com/api-keys
                        </a>
                        {' '}→ then restart the backend server.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-rose-400 hover:text-rose-300 flex-shrink-0 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (shown after conversations start) */}
        {!isEmpty && !isLoading && (
          <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800/50 flex-shrink-0">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50"
              >
                {q.text.length > 30 ? q.text.substring(0, 30) + '…' : q.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
          <div
            className={`flex items-end gap-3 p-3 bg-slate-800 rounded-2xl border transition-all ${
              isLoading ? 'border-slate-700' : 'border-slate-700 focus-within:border-indigo-500'
            }`}
          >
            <textarea
              ref={inputRef}
              id="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                isLoading
                  ? 'Analyzing your data...'
                  : 'Ask about your sales, inventory, or business...'
              }
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-32 leading-relaxed"
              style={{ minHeight: '24px' }}
              aria-label="Chat message input"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim() && !isLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 cursor-pointer'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5 px-1">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-500 font-mono">Enter</kbd> to send ·{' '}
            <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-500 font-mono">Shift+Enter</kbd> for new
            line · Data is read-only and never modified
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
