'use client'
// app/chat/page.js
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useFirestore'
import { askGemini } from '../../lib/gemini'
import AppLayout from '../../components/layout/AppLayout'
import { Send, Sparkles, RotateCcw, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const STARTERS = [
  { icon: '📅', text: 'Create a 2-week study plan for my Math exam next month' },
  { icon: '🧠', text: 'Explain recursion in programming simply' },
  { icon: '🃏', text: 'Generate 5 flashcard questions on Photosynthesis' },
  { icon: '⚡', text: 'Give me the best study tips to improve focus' },
  { icon: '🎯', text: 'Help me prioritize my assignments for this week' },
  { icon: '📝', text: 'What is the Pomodoro technique and how do I use it?' },
]

function fmt(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.2);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>')
    .replace(/\n/g, '<br/>')
}

export default function ChatPage() {
  const { currentUser, userProfile } = useAuth()
  const { tasks } = useTasks(currentUser?.uid)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const ctx = { name: userProfile?.displayName, subjects: userProfile?.subjects, tasks: tasks.filter(t => !t.completed).slice(0, 5) }

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setLoading(true)
    try {
      const reply = await askGemini(next, ctx)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch {
      toast.error('Nova is unavailable. Check your Gemini API key.')
      setMessages(next.slice(0, -1))
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <AppLayout>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header} className="glass">
          <div style={s.headerLeft}>
            <div style={s.novaOrb}>
              <Sparkles size={18} color="var(--cyan)" />
            </div>
            <div>
              <h1 style={s.title}>Nova AI</h1>
              <div style={s.status}><div style={s.dot} /> Your intelligent study companion</div>
            </div>
          </div>
          <button style={s.newBtn} onClick={() => setMessages([])}>
            <RotateCcw size={15} /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div style={s.chatArea}>
          {messages.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyOrb}>
                <Sparkles size={30} color="var(--cyan)" />
              </div>
              <h2 style={s.emptyTitle}>
                Hey {userProfile?.displayName?.split(' ')[0] || 'there'}! I'm <span className="gradient-text">Nova</span> ✨
              </h2>
              <p style={s.emptySub}>Ask me anything about your studies — I'll plan, explain, quiz, and motivate you.</p>
              <div style={s.starters}>
                {STARTERS.map(st => (
                  <button key={st.text} style={s.starterBtn} className="glass" onClick={() => send(st.text)}>
                    <span>{st.icon}</span><span style={{ fontSize: '0.82rem' }}>{st.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.messages}>
              {messages.map((m, i) => (
                <div key={i} style={{ ...s.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'assistant' && <div style={s.botAvatar}><Sparkles size={13} color="var(--cyan)" /></div>}
                  <div style={{ ...s.bubble, ...(m.role === 'user' ? s.userBubble : s.botBubble) }}>
                    <div style={s.msgText} dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
                    {m.role === 'assistant' && (
                      <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(m.content); toast.success('Copied!') }}>
                        <Copy size={11} />
                      </button>
                    )}
                  </div>
                  {m.role === 'user' && <div style={s.userAvatar}>{(userProfile?.displayName?.[0] || 'S').toUpperCase()}</div>}
                </div>
              ))}
              {loading && (
                <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
                  <div style={s.botAvatar}><Sparkles size={13} color="var(--cyan)" /></div>
                  <div style={{ ...s.bubble, ...s.botBubble }}>
                    <div style={s.typing}>
                      {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ ...s.typingDot, animationDelay: `${d}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={s.inputArea} className="glass">
          <div style={s.inputRow}>
            <input
              ref={inputRef}
              style={s.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask Nova anything about your studies…"
              disabled={loading}
            />
            <button style={{ ...s.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }} onClick={() => send()} disabled={!input.trim() || loading}>
              <Send size={17} />
            </button>
          </div>
          <p style={s.hint}>Nova can make mistakes. Double-check important information.</p>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </AppLayout>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border2)', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  novaOrb: { width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,211,238,0.2)' },
  title: { fontSize: '1rem', fontWeight: 800, margin: 0 },
  status: { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  chatArea: { flex: 1, overflow: 'auto', padding: '1.5rem' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '60vh', maxWidth: '580px', margin: '0 auto' },
  emptyOrb: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(34,211,238,0.15)' },
  emptyTitle: { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' },
  emptySub: { color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' },
  starters: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%' },
  starterBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border2)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' },
  messages: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '780px', margin: '0 auto' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  botAvatar: { width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userAvatar: { width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'var(--grad-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff' },
  bubble: { maxWidth: '72%', padding: '11px 15px', borderRadius: '16px', position: 'relative' },
  userBubble: { background: 'var(--grad-1)', borderBottomRightRadius: '4px', boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
  botBubble: { background: 'rgba(13,13,36,0.9)', border: '1px solid var(--border2)', borderBottomLeftRadius: '4px' },
  msgText: { fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text)', wordBreak: 'break-word' },
  copyBtn: { position: 'absolute', top: '6px', right: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  typing: { display: 'flex', gap: '5px', alignItems: 'center', padding: '3px 0' },
  typingDot: { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--indigo-bright)', animation: 'bounce 1.4s infinite ease-in-out' },
  inputArea: { padding: '1rem 1.5rem', borderTop: '1px solid var(--border2)', flexShrink: 0 },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '0.85rem 1.2rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' },
  sendBtn: { width: '46px', height: '46px', borderRadius: '12px', background: 'var(--grad-1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s', boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
  hint: { color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center', marginTop: '8px' },
}
