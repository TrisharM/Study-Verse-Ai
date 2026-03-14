'use client'
// app/pomodoro/page.js
import { useState, useEffect, useRef } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

const MODES = [
  { key: 'focus',      label: 'Focus',       duration: 25 * 60, color: 'var(--indigo-bright)' },
  { key: 'short',      label: 'Short Break', duration:  5 * 60, color: 'var(--cyan)'          },
  { key: 'long',       label: 'Long Break',  duration: 15 * 60, color: 'var(--blue-electric)' },
]

const TIPS = [
  'Silence your phone and close unrelated tabs.',
  'Take notes on paper — it boosts retention.',
  'Stay hydrated! Drink water during breaks.',
  'After 4 pomodoros, take a longer break.',
  'Batch similar tasks together for flow.',
  'Set a clear goal before each session.',
]

export default function PomodoroPage() {
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [task, setTask] = useState('')
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  const intervalRef = useRef(null)

  const mode = MODES[modeIdx]
  const total = mode.duration
  const progress = (timeLeft / total) * 100
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  // Circumference for SVG circle
  const R = 110
  const C = 2 * Math.PI * R
  const dashOffset = C * (1 - (total - timeLeft) / total)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (modeIdx === 0) setSessions(s => s + 1)
            if (window.Notification?.permission === 'granted') {
              new Notification('StudyVerse', { body: `${mode.label} session complete! 🎉` })
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else clearInterval(intervalRef.current)
    return () => clearInterval(intervalRef.current)
  }, [running])

  function switchMode(i) {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIdx(i)
    setTimeLeft(MODES[i].duration)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTimeLeft(mode.duration)
  }

  function requestNotify() {
    if (window.Notification && Notification.permission === 'default') Notification.requestPermission()
  }

  return (
    <AppLayout>
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>Focus Timer</h1>
          <p style={s.sub}>Stay in the zone with Pomodoro technique</p>
        </div>

        {/* Mode switcher */}
        <div style={s.modeSwitcher}>
          {MODES.map((m, i) => (
            <button key={m.key} style={{ ...s.modeBtn, ...(modeIdx === i ? { background: m.color + '22', color: m.color, borderColor: m.color + '55' } : {}) }} onClick={() => switchMode(i)}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Task input */}
        <div style={s.taskRow}>
          <input style={s.taskInput} value={task} onChange={e => setTask(e.target.value)} placeholder="What are you working on? (optional)" />
        </div>

        {/* Circular timer */}
        <div style={s.timerWrap}>
          <div style={s.orbGlow} />
          <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'relative', zIndex: 2 }}>
            {/* Background track */}
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
            {/* Progress arc */}
            <circle
              cx="140" cy="140" r={R}
              fill="none"
              stroke={mode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 140 140)"
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${mode.color})` }}
            />
            {/* Time text */}
            <text x="140" y="132" textAnchor="middle" fill="var(--text)" fontSize="48" fontWeight="900" fontFamily="'Cabinet Grotesk',sans-serif">{mins}:{secs}</text>
            <text x="140" y="162" textAnchor="middle" fill="var(--text-muted)" fontSize="14" fontFamily="'Cabinet Grotesk',sans-serif">{mode.label}</text>
            {task && <text x="140" y="186" textAnchor="middle" fill={mode.color} fontSize="11" fontFamily="'Cabinet Grotesk',sans-serif">{task.slice(0, 30)}{task.length > 30 ? '…' : ''}</text>}
          </svg>
        </div>

        {/* Controls */}
        <div style={s.controls}>
          <button style={s.ctrlBtn} onClick={reset}><RotateCcw size={18} color="var(--text-muted)" /></button>
          <button style={{ ...s.playBtn, background: `linear-gradient(135deg, ${mode.color}, ${mode.color}aa)`, boxShadow: `0 0 30px ${mode.color}55` }} onClick={() => { setRunning(r => !r); requestNotify() }}>
            {running ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: '3px' }} />}
          </button>
          <button style={s.ctrlBtn} onClick={() => switchMode((modeIdx + 1) % MODES.length)}><SkipForward size={18} color="var(--text-muted)" /></button>
        </div>

        {/* Stats + tip */}
        <div style={s.bottom}>
          <div style={s.statsRow}>
            {[
              { label: 'Sessions today', value: sessions, emoji: '🍅' },
              { label: 'Focus time',     value: `${Math.floor(sessions * 25)}m`, emoji: '⏱️' },
              { label: 'Streak',         value: sessions >= 4 ? '🔥' : `${4 - sessions} left`, emoji: '🎯' },
            ].map(stat => (
              <div key={stat.label} style={s.statCard} className="glass">
                <div style={s.statEmoji}>{stat.emoji}</div>
                <div style={s.statValue}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={s.tipBox} className="glass">
            <span style={s.tipIcon}>💡</span>
            <span style={s.tipText}>{tip}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  modeSwitcher: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' },
  modeBtn: { padding: '7px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '999px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  taskRow: { display: 'flex', justifyContent: 'center', marginBottom: '2rem' },
  taskInput: { width: '100%', maxWidth: '360px', padding: '0.7rem 1.2rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '999px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', textAlign: 'center' },
  timerWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '2rem' },
  orbGlow: { position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  controls: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' },
  ctrlBtn: { width: '46px', height: '46px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  playBtn: { width: '70px', height: '70px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s' },
  bottom: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' },
  statCard: { padding: '1rem', borderRadius: '14px', textAlign: 'center' },
  statEmoji: { fontSize: '1.3rem', marginBottom: '4px' },
  statValue: { fontSize: '1.4rem', fontWeight: 900, color: 'var(--indigo-bright)' },
  statLabel: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' },
  tipBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem 1.25rem', borderRadius: '12px' },
  tipIcon: { fontSize: '1.1rem', flexShrink: 0 },
  tipText: { fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' },
}
