const OpenAI = require('openai');
const analytics = require('./businessAnalytics.service');

// ──────────────────────────────────────────────────────────────────────────────
// Validated tool definitions (function-calling spec for OpenAI)
// ──────────────────────────────────────────────────────────────────────────────
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'getSalesSummary',
      description:
        'Returns total revenue, cost of goods, gross profit, gross margin %, units sold, discount, tax, and invoice count for a date range. Use this to answer revenue or sales questions.',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format. Leave null for all time.',
          },
          endDate: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format. Leave null for all time.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compareSalesPeriods',
      description:
        'Compares two date ranges (current vs previous) for revenue, profit, and units sold. Use for questions like "compare this month vs last month".',
      parameters: {
        type: 'object',
        properties: {
          currentStart: { type: 'string', description: 'Current period start (YYYY-MM-DD).' },
          currentEnd: { type: 'string', description: 'Current period end (YYYY-MM-DD).' },
          previousStart: { type: 'string', description: 'Previous period start (YYYY-MM-DD).' },
          previousEnd: { type: 'string', description: 'Previous period end (YYYY-MM-DD).' },
        },
        required: ['currentStart', 'currentEnd', 'previousStart', 'previousEnd'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTopSellingProducts',
      description:
        'Returns the best-selling products ranked by units sold, with revenue and gross profit. Use for "best sellers", "top products", etc.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD). Optional.' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD). Optional.' },
          limit: {
            type: 'integer',
            description: 'Number of products to return (max 20, default 10).',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSlowMovingProducts',
      description:
        'Returns products with zero or very low sales in the specified number of days. Use for "slow movers", "dead stock", "not selling" questions.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'integer',
            description: 'Look-back period in days (max 365, default 30).',
          },
          limit: {
            type: 'integer',
            description: 'Number of products to return (max 30, default 20).',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLowStockProducts',
      description:
        'Returns products currently at or below their minimum stock level, including out-of-stock items. Use for "restock", "low inventory", "stock alert" questions.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getStockoutRiskProducts',
      description:
        'Returns products that may run out of stock within the next 14 days based on 30-day sales velocity. Includes risk levels: critical (≤3 days), high (≤7 days), medium (≤14 days).',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getProductProfitability',
      description:
        'Returns gross profit per product sorted from most to least profitable. Use for questions about margins, profitability, or which products make the most money.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD). Optional.' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD). Optional.' },
          limit: {
            type: 'integer',
            description: 'Number of products to return (max 30, default 20).',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBusinessOverview',
      description:
        'Returns a comprehensive business snapshot: sales summary, top 5 products, low-stock list, stockout risks, and inventory stats. Use for general business health questions.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date (YYYY-MM-DD). Optional.' },
          endDate: { type: 'string', description: 'End date (YYYY-MM-DD). Optional.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSalesTrend',
      description:
        'Returns a daily revenue and invoice count trend for the last N days. Use for trend, chart, or time-series questions.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'integer',
            description: 'Number of days to look back (max 90, default 30).',
          },
        },
      },
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Approved tool executor – the AI may ONLY call these functions
// ──────────────────────────────────────────────────────────────────────────────
const APPROVED_TOOLS = new Set([
  'getSalesSummary',
  'compareSalesPeriods',
  'getTopSellingProducts',
  'getSlowMovingProducts',
  'getLowStockProducts',
  'getStockoutRiskProducts',
  'getProductProfitability',
  'getBusinessOverview',
  'getSalesTrend',
]);

/**
 * Validate and clamp date range arguments to prevent very large queries.
 */
const sanitizeArgs = (toolName, rawArgs) => {
  const args = { ...rawArgs };

  // Ensure limit caps
  if (args.limit !== undefined) {
    args.limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);
  }
  if (args.days !== undefined) {
    args.days = Math.min(Math.max(Number(args.days) || 30, 1), 365);
  }

  // Validate date strings
  const validateDate = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return null;
    // Reject future dates more than 1 year ahead
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (parsed > maxDate) return null;
    return d;
  };

  if (args.startDate !== undefined) args.startDate = validateDate(args.startDate);
  if (args.endDate !== undefined) args.endDate = validateDate(args.endDate);
  if (args.currentStart !== undefined) args.currentStart = validateDate(args.currentStart);
  if (args.currentEnd !== undefined) args.currentEnd = validateDate(args.currentEnd);
  if (args.previousStart !== undefined) args.previousStart = validateDate(args.previousStart);
  if (args.previousEnd !== undefined) args.previousEnd = validateDate(args.previousEnd);

  return args;
};

/**
 * Execute an approved analytics tool with validated arguments.
 * User context is always derived from the JWT-verified user object.
 */
const executeTool = async (toolName, rawArgs, user) => {
  if (!APPROVED_TOOLS.has(toolName)) {
    throw new Error(`Tool '${toolName}' is not an approved analytics function.`);
  }

  const args = sanitizeArgs(toolName, rawArgs);

  switch (toolName) {
    case 'getSalesSummary':
      return analytics.getSalesSummary(user, args.startDate, args.endDate);
    case 'compareSalesPeriods':
      return analytics.compareSalesPeriods(
        user,
        args.currentStart,
        args.currentEnd,
        args.previousStart,
        args.previousEnd
      );
    case 'getTopSellingProducts':
      return analytics.getTopSellingProducts(user, args.startDate, args.endDate, args.limit);
    case 'getSlowMovingProducts':
      return analytics.getSlowMovingProducts(user, args.days, args.limit);
    case 'getLowStockProducts':
      return analytics.getLowStockProducts(user);
    case 'getStockoutRiskProducts':
      return analytics.getStockoutRiskProducts(user);
    case 'getProductProfitability':
      return analytics.getProductProfitability(user, args.startDate, args.endDate, args.limit);
    case 'getBusinessOverview':
      return analytics.getBusinessOverview(user, args.startDate, args.endDate);
    case 'getSalesTrend':
      return analytics.getSalesTrend(user, args.days);
    default:
      throw new Error(`Unhandled tool: ${toolName}`);
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// System prompt – instructs the AI on its role and restrictions
// ──────────────────────────────────────────────────────────────────────────────
const buildSystemPrompt = (user, shopName) => {
  const today = new Date().toISOString().split('T')[0];
  const role = user.role === 'owner' ? 'Shop Owner' : 'Worker';

  return `You are an AI Business Assistant for "${shopName || 'the shop'}", a smart inventory and sales management system.

Today's date: ${today}
User role: ${role} (${user.name})

YOUR PURPOSE:
- Help the ${role} understand their business performance using real data from their store database.
- Provide actionable, specific recommendations based on actual MongoDB sales and inventory data.
- Be concise, clear, and professional.

STRICT RULES:
1. ONLY use the provided tools to retrieve data. NEVER invent, guess, or fabricate any sales figures, stock levels, product names, profit numbers, or business statistics.
2. If a tool returns no data or empty results, say so clearly — do NOT fill in with made-up numbers.
3. Clearly distinguish between REVENUE (total sales) and GROSS PROFIT (revenue minus cost of goods sold). NEVER call revenue "profit" or "net profit".
4. Do NOT claim net profit — the system does not track all expenses (rent, salaries, utilities, etc.).
5. Gross profit = Revenue − Cost of Goods Sold (COGS). This is tracked in the system.
6. When recommending restocking, base it on actual stock levels and sales velocity from the data.
7. Do NOT modify, delete, create, or suggest executing any database operations. You are READ-ONLY.
8. Format your response clearly with sections, bullet points, and tables where helpful.
9. If the user asks something outside business analytics (e.g., write code, personal advice), politely decline.
10. Keep responses focused and practical — no more than 600 words unless the question genuinely requires more detail.

WHEN CALLING TOOLS:
- Always call the most relevant tool(s) for the question before responding.
- For "improve my business" or general health questions, call getBusinessOverview first.
- For "restock" or "stockout" questions, call getLowStockProducts and getStockoutRiskProducts.
- For "best sellers" or "top products", call getTopSellingProducts.
- For "slow movers" or "dead stock", call getSlowMovingProducts.
- For "sales this month vs last month", call compareSalesPeriods with appropriate dates.
- For "profit margins", call getProductProfitability.
- You may call multiple tools if needed to give a complete answer.

Currency symbol: $ (use this in all monetary values shown to the user).`;
};

// ──────────────────────────────────────────────────────────────────────────────
// Main chat function
// ──────────────────────────────────────────────────────────────────────────────
const chat = async ({ message, conversationHistory = [], user, shopName }) => {
  // Validate OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim() || apiKey.trim() === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in backend/.env');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey });

  const systemPrompt = buildSystemPrompt(user, shopName);

  // Build messages array: system + history + new user message
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // keep last 10 turns to stay within token limits
    { role: 'user', content: message },
  ];

  // ── Round 1: Let AI call tools ──────────────────────────────────────────────
  const MAX_TOOL_ROUNDS = 3; // prevent runaway loops
  let toolRound = 0;
  let currentMessages = [...messages];

  while (toolRound < MAX_TOOL_ROUNDS) {
    const response = await client.chat.completions.create({
      model,
      messages: currentMessages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
      max_tokens: 1500,
      temperature: 0.3,
    });

    const choice = response.choices[0];
    const assistantMsg = choice.message;

    // If no tool calls, we have the final answer
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const reply = assistantMsg.content || 'I was unable to generate a response. Please try again.';
      return { reply, toolsUsed: [] };
    }

    // Append assistant message with tool_calls to the conversation
    currentMessages.push(assistantMsg);

    const toolsUsed = [];

    // Execute each tool call
    for (const toolCall of assistantMsg.tool_calls) {
      const toolName = toolCall.function.name;
      let rawArgs = {};
      try {
        rawArgs = JSON.parse(toolCall.function.arguments || '{}');
      } catch {
        rawArgs = {};
      }

      let toolResult;
      try {
        toolResult = await executeTool(toolName, rawArgs, user);
        toolsUsed.push(toolName);
      } catch (err) {
        toolResult = { error: `Tool execution failed: ${err.message}` };
      }

      // Append tool result to messages
      currentMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }

    toolRound++;

    // Check if AI wants to call more tools or give final answer
    if (choice.finish_reason === 'tool_calls') {
      continue; // AI has more tool calls to make
    }
  }

  // Final response after tool rounds
  const finalResponse = await client.chat.completions.create({
    model,
    messages: currentMessages,
    max_tokens: 1500,
    temperature: 0.3,
  });

  const reply =
    finalResponse.choices[0]?.message?.content ||
    'I was unable to generate a response. Please try again.';

  return { reply };
};

module.exports = { chat };
