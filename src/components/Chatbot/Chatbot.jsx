import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { marked } from 'marked';
import { useLocation } from 'react-router-dom';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = "You are a FIFA World Cup analyst with deep knowledge of WC history from 1930 to 2022. You have access to real-time web search. Answer analytically - give numbers, cite patterns, compare eras. Never be vague. Keep responses concise and sharp. No filler phrases. Use Markdown for formatting.";
const TRIGGER_KEYWORDS = ["2026", "current", "latest", "recent", "predict", "news"];

// Route-specific suggested questions
const ROUTE_SUGGESTIONS = {
  '/': [
    "Which team has the most WC titles?",
    "Most goals scored in a single WC?",
    "2026 World Cup favorites?",
  ],
  '/goals': [
    "Which minute sees the most WC goals?",
    "Do teams score more in 2nd half?",
    "Most goals in a single WC match?",
  ],
  '/clubs': [
    "Which club supplies most WC players?",
    "Has Premier League dominance grown over time?",
    "Which domestic league has the most WC winners?",
  ],
  '/penalties': [
    "Which team is worst at WC shootouts?",
    "What is the average WC shootout conversion rate?",
    "Most dramatic WC penalty shootout ever?",
  ],
  '/h2h': [
    "Most lopsided WC result ever?",
    "Which rivalry has the most WC meetings?",
    "Brazil vs Argentina WC head-to-head record?",
  ],
  '/squads': [
    "What is the ideal squad age for a WC winner?",
    "Youngest team to win the World Cup?",
    "Do older squads really underperform at WCs?",
  ],
  '/referees': [
    "Are WC referees statistically biased?",
    "Most cards given in a single WC tournament?",
    "Which confederation gets the most yellow cards?",
  ],
  '/groups': [
    "What makes a Group of Death at the WC?",
    "Hardest group in WC history?",
    "Does group stage performance predict final outcome?",
  ],
  '/wonders': [
    "How many WC goals did Messi score in 2022?",
    "Is Messi the greatest WC player ever?",
    "Will Messi play in 2026?",
  ],
};

const DEFAULT_SUGGESTIONS = [
  "Best WC they never won?",
  "Most WC goals all time?",
  "WC 2026 favorites?",
];

let groqClient = null;
try {
  groqClient = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });
} catch (e) {
  console.error("Failed to initialize API clients", e);
}

// Argentina theme tokens (used on /wonders route)
const ARG_THEME = {
  bg:         '#000B1E',
  cardBg:     '#011535',
  border:     'rgba(116,172,223,0.25)',
  headerBg:   'linear-gradient(135deg, #011B4E 0%, #012966 100%)',
  accent:     '#74ACDF',
  accentDark: '#4A7FAF',
  gold:       '#F6B40E',
  userBubble: 'linear-gradient(135deg, #74ACDF, #4A7FAF)',
  botBubble:  'rgba(1,27,78,0.8)',
  text:       '#E8F4FF',
  textMuted:  'rgba(168,207,239,0.5)',
  inputBg:    'rgba(1,27,78,0.6)',
  btnBg:      'linear-gradient(135deg, #001233, #011B4E)',
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputStr, setInputStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'What World Cup data would you like me to analyze?' }
  ]);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const isMessi = location.pathname === '/wonders';

  const suggestions = ROUTE_SUGGESTIONS[location.pathname] || DEFAULT_SUGGESTIONS;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Reset suggestions when route changes and chat has only the greeting
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ role: 'assistant', content: 'What World Cup data would you like me to analyze?' }]);
    }
  }, [location.pathname]);

  const handleQuery = async (query) => {
    if (!query.trim() || !groqClient) return;

    const newMsg = { role: 'user', content: query };
    setMessages(p => [...p, newMsg]);
    setInputStr('');
    setIsLoading(true);

    try {
      const lowerQuery = query.toLowerCase();
      const needsSearch = TRIGGER_KEYWORDS.some(kw => lowerQuery.includes(kw));
      let contextMsg = null;

      if (needsSearch) {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: import.meta.env.VITE_TAVILY_API_KEY,
            query: query,
            search_depth: "advanced",
            include_answer: true
          })
        });

        if (response.ok) {
          const searchRes = await response.json();
          const contextStr = `TAVILY SEARCH RESULTS:\nDirect Answer: ${searchRes.answer}\nContext:\n${searchRes.results.map(r => r.content).join("\n")}`;
          contextMsg = { role: 'system', content: contextStr };
        }
      }

      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        newMsg
      ];

      if (contextMsg) {
        apiMessages.splice(apiMessages.length - 1, 0, contextMsg);
      }

      const completion = await groqClient.chat.completions.create({
        messages: apiMessages,
        model: "llama-3.3-70b-versatile",
      });

      setMessages(p => [...p, { role: 'assistant', content: completion.choices[0].message.content }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Simulation Error: Connection to Oracle failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Label for the current section
  const sectionLabel = {
    '/': 'Dashboard',
    '/goals': 'Minute Heatmap',
    '/clubs': 'Club Dominance',
    '/penalties': 'Shootout Graveyard',
    '/h2h': 'Head-to-Head',
    '/squads': 'Age vs Performance',
    '/referees': 'Referee Audit',
    '/groups': 'Group of Death',
    '/wonders': 'Messi Chronicle',
  }[location.pathname] || 'WC Oracle';

  return (
    <>
      <div
        className={clsx(
          "fixed z-50 transition-all duration-300 ease-spring left-1/2 -translate-x-1/2",
          isOpen ? "bottom-4 w-[400px] max-w-[95vw] shadow-2xl h-[520px]" : "bottom-6"
        )}
      >
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="border-2 px-6 py-3 rounded-full font-sans font-bold flex items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-transform"
            style={isMessi ? {
              background: ARG_THEME.btnBg,
              borderColor: ARG_THEME.accent,
              color: ARG_THEME.accent,
              boxShadow: `0 0 20px rgba(116,172,223,0.3)`,
            } : {
              background: 'var(--color-inkPrimary, #1a1a1a)',
              borderColor: 'var(--color-borderLight, #e5e5e5)',
              color: 'var(--color-bg, #fff)',
            }}
          >
            <span
              className="w-4 h-4 rounded-sm animate-pulse"
              style={isMessi
                ? { background: ARG_THEME.gold }
                : {
                    background: '#F6B40E',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.24), 0 0 12px rgba(246,180,14,0.55)',
                  }
              }
            />
            {isMessi ? 'Vamos Argentina' : 'Hey FIFA'}
          </button>
        ) : (
          <div
            className="rounded-3xl h-full flex flex-col overflow-hidden relative"
            style={isMessi ? {
              background: ARG_THEME.bg,
              border: `1px solid ${ARG_THEME.border}`,
              boxShadow: `0 32px 64px rgba(0,0,0,0.7), 0 0 40px rgba(116,172,223,0.15)`,
            } : {
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 32px 64px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex justify-between items-center z-10 sticky top-0"
              style={isMessi ? {
                background: ARG_THEME.headerBg,
                borderBottom: `1px solid ${ARG_THEME.border}`,
              } : { background: 'var(--color-accentPrimary)' }}
            >
              <div className="flex flex-col">
                <span className="font-bold" style={{ color: isMessi ? ARG_THEME.accent : 'white' }}>
                  {isMessi ? 'La Pulga Oracle' : 'WC Oracle'}
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: isMessi ? ARG_THEME.gold : 'rgba(255,255,255,0.6)' }}
                >
                  {sectionLabel} context active
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="pb-1 font-mono text-xl leading-none px-2 rounded-full transition-colors"
                style={isMessi ? { color: ARG_THEME.textMuted } : { color: 'rgba(255,255,255,0.7)' }}
              >
                x
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
              style={isMessi ? { background: 'transparent' } : {}}
            >
              {messages.length === 1 && (
                <div
                  className="flex flex-col gap-2 pb-4"
                  style={isMessi
                    ? { borderBottom: `1px solid ${ARG_THEME.border}` }
                    : { borderBottom: '1px solid #E2E8F0' }
                  }
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest mb-1 px-1"
                    style={{ color: isMessi ? ARG_THEME.textMuted : 'var(--color-inkMuted)' }}
                  >
                    Ask about {sectionLabel}
                  </div>
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleQuery(s)}
                      className="text-left text-xs px-3 py-2 rounded-xl transition-colors font-medium"
                      style={isMessi ? {
                        background: 'rgba(116,172,223,0.08)',
                        border: `1px solid ${ARG_THEME.border}`,
                        color: ARG_THEME.accent,
                      } : {
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        color: '#1A1A1A',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={clsx(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                  )}
                >
                  <div
                    className="p-3 px-4 text-sm font-sans [&>ul]:list-disc [&>ul]:ml-4 [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-bold"
                    style={isMessi
                      ? m.role === 'user'
                        ? { background: ARG_THEME.userBubble, color: 'white', borderRadius: '16px 16px 4px 16px' }
                        : { background: ARG_THEME.botBubble, color: ARG_THEME.text, border: `1px solid ${ARG_THEME.border}`, borderRadius: '16px 16px 16px 4px' }
                      : m.role === 'user'
                        ? { background: '#2D5A27', color: 'white', borderRadius: '16px 16px 4px 16px' }
                        : { background: '#F1F5F9', color: '#1A1A1A', border: '1px solid #E2E8F0', borderRadius: '16px 16px 16px 4px' }
                    }
                    dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }}
                  />
                </div>
              ))}

              {isLoading && (
                <div
                  className="self-start p-3 px-4 flex gap-1 items-center h-10 w-16 rounded-t-xl rounded-r-xl rounded-bl-sm"
                  style={isMessi
                    ? { background: ARG_THEME.botBubble, border: `1px solid ${ARG_THEME.border}` }
                    : { background: '#F1F5F9', border: '1px solid #E2E8F0' }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: isMessi ? ARG_THEME.accent : 'var(--color-inkMuted)' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.1s]" style={{ background: isMessi ? ARG_THEME.accent : 'var(--color-inkMuted)' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: isMessi ? ARG_THEME.accent : 'var(--color-inkMuted)' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={e => { e.preventDefault(); handleQuery(inputStr); }}
              className="p-3 shrink-0 z-10 sticky bottom-0"
              style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}
            >
              <div className="flex w-full items-center rounded-full overflow-hidden" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                <input
                  type="text"
                  value={inputStr}
                  onChange={e => setInputStr(e.target.value)}
                  placeholder={`Ask about ${sectionLabel}...`}
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-sm"
                  style={{ color: '#1A1A1A' }}
                />
                <button
                  type="submit"
                  disabled={!inputStr.trim() || isLoading}
                  className="p-3 px-4 font-bold disabled:opacity-50 transition-colors"
                  style={{ color: '#2D5A27' }}
                >
                  -&gt;
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
