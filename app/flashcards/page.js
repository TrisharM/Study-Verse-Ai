'use client'
// app/flashcards/page.js
import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { generateFlashcards } from '../../lib/gemini'
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(10)
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())

  async function generate() {
    if (!topic.trim()) return toast.error('Enter a topic')
    setLoading(true)
    try {
      const result = await generateFlashcards(topic, count)
      setCards(result)
      setIdx(0)
      setFlipped(false)
      setKnown(new Set())
      toast.success(`${result.length} flashcards ready!`)
    } catch { toast.error('Generation failed. Check your Gemini API key.') }
    finally { setLoading(false) }
  }

  function prev() { setIdx(i => Math.max(0, i - 1)); setFlipped(false) }
  function next() { setIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false) }
  function markKnown() { setKnown(s => { const n = new Set(s); n.has(idx) ? n.delete(idx) : n.add(idx); return n }); next() }
  function shuffle() {
    setCards(c => [...c].sort(() => Math.random() - 0.5))
    setIdx(0); setFlipped(false)
    toast.success('Shuffled!')
  }

  const card = cards[idx]

  return (
    <AppLayout>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>AI Flashcards</h1>
          <p style={s.sub}>Generate a full deck on any topic instantly</p>
        </div>

        {/* Generator */}
        <div style={s.genCard} className="glass glow-border">
          <h3 style={s.genTitle}><Sparkles size={16} color="var(--indigo-bright)" /> Generate Flashcards</h3>
          <div style={s.genRow}>
            <input style={s.input} value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic (e.g. Photosynthesis, World War II, React Hooks)" onKeyDown={e => e.key === 'Enter' && generate()} />
            <select style={{ ...s.input, width: '110px', flexShrink: 0 }} value={count} onChange={e => setCount(+e.target.value)}>
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
            </select>
            <button style={s.genBtn} onClick={generate} disabled={loading}>
              <Sparkles size={15} /> {loading ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Flashcard viewer */}
        {cards.length > 0 && (
          <div style={s.viewer}>
            {/* Progress bar */}
            <div style={s.progressWrap}>
              <div style={{ ...s.progressBar, width: `${((idx + 1) / cards.length) * 100}%` }} />
            </div>
            <div style={s.progressLabel}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{idx + 1} / {cards.length}</span>
              <span style={{ color: 'var(--cyan)', fontSize: '0.82rem', fontWeight: 700 }}>✓ {known.size} known</span>
              <button style={s.shuffleBtn} onClick={shuffle}><Shuffle size={13} /> Shuffle</button>
            </div>

            {/* Card with flip */}
            <div style={s.cardWrap} onClick={() => setFlipped(f => !f)}>
              <div style={{ ...s.card3d, transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                {/* Front */}
                <div style={{ ...s.face, ...s.front, boxShadow: known.has(idx) ? '0 0 40px rgba(34,211,238,0.2)' : 'var(--glow-indigo)' }} className="glass glow-border">
                  <div style={s.faceLabel}>QUESTION</div>
                  <p style={s.faceText}>{card.question}</p>
                  <div style={s.flipHint}>tap to reveal answer</div>
                </div>
                {/* Back */}
                <div style={{ ...s.face, ...s.back, transform: 'rotateY(180deg)', background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.2)' }} className="glow-border">
                  <div style={{ ...s.faceLabel, color: 'var(--cyan)' }}>ANSWER</div>
                  <p style={s.faceText}>{card.answer}</p>
                  <div style={s.flipHint}>tap to flip back</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={s.navRow}>
              <button style={s.navBtn} onClick={prev} disabled={idx === 0}><ChevronLeft size={20} /></button>
              <div style={s.actionBtns}>
                <button style={s.dontKnowBtn} onClick={() => { setFlipped(false); next() }}>😕 Not yet</button>
                <button style={s.knowBtn} onClick={markKnown}>✓ Got it!</button>
              </div>
              <button style={s.navBtn} onClick={next} disabled={idx === cards.length - 1}><ChevronRight size={20} /></button>
            </div>

            {/* Reset */}
            {idx === cards.length - 1 && (
              <div style={s.doneRow}>
                <div style={s.doneCard} className="glass glow-border">
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                  <p style={{ fontWeight: 800, marginBottom: '4px' }}>Deck complete!</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>You knew {known.size} out of {cards.length} cards</p>
                  <button style={s.restartBtn} onClick={() => { setIdx(0); setFlipped(false); setKnown(new Set()) }}>
                    <RotateCcw size={14} /> Restart Deck
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .card-wrap { perspective: 1200px; }
        .face { backface-visibility: hidden; }
      `}</style>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '680px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  genCard: { borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' },
  genTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' },
  genRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  input: { flex: 1, minWidth: '180px', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' },
  genBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1.25rem', background: 'var(--grad-1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)', flexShrink: 0 },
  viewer: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  progressWrap: { height: '4px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'var(--grad-1)', borderRadius: '999px', transition: 'width 0.3s ease' },
  progressLabel: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  shuffleBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' },
  cardWrap: { perspective: '1200px', cursor: 'pointer', height: '260px' },
  card3d: { width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)' },
  face: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(7,7,26,0.9)', border: '1px solid rgba(99,102,241,0.2)' },
  front: {},
  back: {},
  faceLabel: { fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-bright)', letterSpacing: '2px', marginBottom: '1rem' },
  faceText: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.6 },
  flipHint: { position: 'absolute', bottom: '1rem', color: 'var(--text-muted)', fontSize: '0.72rem' },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
  navBtn: { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, disabled: { opacity: 0.3 } },
  actionBtns: { display: 'flex', gap: '0.75rem' },
  dontKnowBtn: { padding: '10px 22px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', color: '#f87171', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' },
  knowBtn: { padding: '10px 22px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px', color: 'var(--cyan)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' },
  doneRow: { display: 'flex', justifyContent: 'center' },
  doneCard: { padding: '2rem', borderRadius: '20px', textAlign: 'center', maxWidth: '320px' },
  restartBtn: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 20px', background: 'var(--grad-1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' },
}
