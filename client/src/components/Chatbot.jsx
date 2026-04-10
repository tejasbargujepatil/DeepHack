import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services';

// Bold markdown renderer
function BotMessage({ text }) {
  return (
    <div style={{ fontSize: '13px', lineHeight: 1.65, color: '#2A4A29' }}>
      {text.split('\n').map((line, i) => (
        <p key={i} style={{ marginBottom: i < text.split('\n').length - 1 ? '4px' : 0 }}>
          {line.split(/\*\*(.*?)\*\*/g).map((seg, si) =>
            si % 2 === 1
              ? <strong key={si} style={{ color: '#1B3C1A', fontWeight: 600 }}>{seg}</strong>
              : seg
          )}
        </p>
      ))}
    </div>
  );
}

const QUICK_PROMPTS = [
  'Track my order',
  'Payment methods',
  'Return policy',
  'Show me laptops',
  'Shipping info',
];

export default function Chatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m TechDrill\'s AI assistant 👋\n\nAsk me about **orders, products, payments, shipping**, or anything else!' }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150); }, [open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    const newMsg = { from: 'user', text: q };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);
    try {
      // Pass full history so backend can use conversation context
      const history = updatedMsgs
        .filter(m => m.from === 'user')
        .map(m => m.text);
      const { data } = await aiService.chat(q, history);
      await new Promise(r => setTimeout(r, 250));
      setMessages(m => [...m, { from: 'bot', text: data.data.response }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([{ from: 'bot', text: 'Chat cleared. How can I help you?' }]);

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '50%', border: 'none',
          background: open ? '#1B3C1A' : '#2E7D32',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(27,60,26,0.4)',
          transition: 'background 0.2s',
        }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></motion.svg>
            : <motion.svg key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></motion.svg>
          }
        </AnimatePresence>
        {!open && messages.length > 1 && (
          <span style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg)' }} />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: '88px', right: '24px', zIndex: 1000,
              width: '370px', height: '540px',
              background: '#fff', border: '1px solid rgba(27,60,26,0.12)',
              borderRadius: '20px', display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 80px rgba(27,60,26,0.2)',
              overflow: 'hidden',
            }}>

            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(27,60,26,0.1)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, background: '#1B3C1A' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
                <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', background: '#4CAF50', borderRadius: '50%', border: '2px solid #1B3C1A' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', serif" }}>TechDrill AI</p>
                <p style={{ fontSize: '11px', color: loading ? '#FFC107' : '#4CAF50' }}>{loading ? 'Thinking...' : '● Online'}</p>
              </div>
              <button onClick={reset} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                Clear
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }} className="no-scrollbar">

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                  {msg.from === 'bot' && (
                    <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '10px 13px', borderRadius: '14px',
                    ...(msg.from === 'user' ? {
                      background: '#1B3C1A', color: '#fff',
                      borderBottomRightRadius: '4px',
                      fontSize: '13px', lineHeight: 1.55,
                    } : {
                      background: '#F4FAF4', border: '1px solid rgba(27,60,26,0.1)',
                      borderBottomLeftRadius: '4px',
                    }),
                  }}>
                    {msg.from === 'bot'
                      ? <BotMessage text={msg.text} />
                      : <p style={{ fontSize: '13px', lineHeight: 1.55 }}>{msg.text}</p>
                    }
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>🤖</div>
                  <div style={{ padding: '10px 13px', borderRadius: '14px', borderBottomLeftRadius: '4px', background: '#F4FAF4', border: '1px solid rgba(27,60,26,0.1)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 150, 300].map(d => <span key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E7D32', opacity:0.5, display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: `${d}ms` }} />)}
                    <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick prompts (first interaction only) */}
            {messages.length <= 2 && (
              <div style={{ padding: '0 12px 10px', display: 'flex', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)}
                    style={{ fontSize: '11px', fontWeight: 500, padding: '5px 10px', borderRadius: '99px', border: '1px solid rgba(27,60,26,0.2)', background: '#F0F5F0', color: '#1B3C1A', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1B3C1A'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F0F5F0'; e.currentTarget.style.color = '#1B3C1A'; }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px', borderTop: '1px solid rgba(27,60,26,0.1)', display: 'flex', gap: '8px', flexShrink: 0, background: '#F8FAF8' }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask anything..." disabled={loading}
                style={{ flex: 1, background: '#fff', border: '1.5px solid rgba(27,60,26,0.15)', borderRadius: '10px', padding: '9px 13px', fontSize: '13px', color: '#0D1B0D', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#1B3C1A'}
                onBlur={e  => e.target.style.borderColor = 'rgba(27,60,26,0.15)'} />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', background: input.trim() && !loading ? '#1B3C1A' : 'rgba(0,0,0,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                {loading
                  ? <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
