/* global process */

const SYSTEM_PROMPT = 'You are a FIFA World Cup analyst with deep knowledge of World Cup history from 1930 to 2022. Answer analytically with numbers, patterns, and era comparisons. Keep responses concise and sharp. Use Markdown for formatting.';
const TRIGGER_KEYWORDS = ['2026', 'current', 'latest', 'recent', 'predict', 'news'];

const buckets = new Map();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const DAILY_LIMIT = toInt(process.env.CHAT_DAILY_LIMIT, 25);
const WINDOW_LIMIT = toInt(process.env.CHAT_WINDOW_LIMIT, 6);
const WINDOW_MS = toInt(process.env.CHAT_WINDOW_MS, 10 * 60 * 1000);
const MAX_QUERY_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;

function getClientKey(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkLimit(key) {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const bucket = buckets.get(key) || {
    day,
    dailyCount: 0,
    windowStartedAt: now,
    windowCount: 0,
  };

  if (bucket.day !== day) {
    bucket.day = day;
    bucket.dailyCount = 0;
  }

  if (now - bucket.windowStartedAt > WINDOW_MS) {
    bucket.windowStartedAt = now;
    bucket.windowCount = 0;
  }

  if (bucket.dailyCount >= DAILY_LIMIT || bucket.windowCount >= WINDOW_LIMIT) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.dailyCount += 1;
  bucket.windowCount += 1;
  buckets.set(key, bucket);
  return true;
}

function sanitizeMessages(messages = []) {
  return messages
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 1200),
    }));
}

async function getSearchContext(query) {
  if (!process.env.TAVILY_API_KEY) return null;

  const lowerQuery = query.toLowerCase();
  const needsSearch = TRIGGER_KEYWORDS.some((keyword) => lowerQuery.includes(keyword));
  if (!needsSearch) return null;

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 4,
    }),
  });

  if (!response.ok) return null;

  const searchRes = await response.json();
  const snippets = (searchRes.results || [])
    .map((result) => result.content)
    .filter(Boolean)
    .join('\n')
    .slice(0, 2400);

  return `TAVILY SEARCH RESULTS:\nDirect Answer: ${searchRes.answer || 'No direct answer'}\nContext:\n${snippets}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Chatbot is not configured.' });
  }

  const clientKey = getClientKey(req);
  if (!checkLimit(clientKey)) {
    return res.status(429).json({ error: 'Chat limit reached. Please try again later.' });
  }

  const query = String(req.body?.query || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: 'Query is too long.' });
  }

  try {
    const history = sanitizeMessages(req.body?.messages);
    const searchContext = await getSearchContext(query);
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
    ];

    if (searchContext) {
      groqMessages.push({ role: 'system', content: searchContext });
    }

    groqMessages.push({ role: 'user', content: query });

    const completion = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.4,
        max_tokens: 650,
      }),
    });

    const payload = await completion.json();
    if (!completion.ok) {
      return res.status(502).json({ error: 'Model request failed.' });
    }

    return res.status(200).json({
      answer: payload.choices?.[0]?.message?.content || 'No answer returned.',
    });
  } catch {
    return res.status(500).json({ error: 'Chat request failed.' });
  }
}
