'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '../../context/AuthContext'
import { Sparkles } from 'lucide-react'

const NeuralNetwork = dynamic(() => import('../../components/3d/NeuralNetwork'), { ssr: false })

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Study while others are sleeping.", author: "William A. Ward" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
]

export default function SplashPage() {
  const { currentUser, userProfile } = useAuth()
  const router = useRouter()
  const [phase, setPhase] = useState('enter')
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!currentUser) { router.push('/auth'); return }
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); return 100 } return p + 2 })
    }, 60)
    const timer = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => router.push('/dashboard'), 600)
    }, 3000)
    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [currentUser])

  const name = userProfile?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Student'

  return (
    <div style={{ ...s.page, animation: phase === 'exit' ? 'splash-out 0.6s ease forwards' : 'fadeIn 0.8s ease forwards' }}>
      <NeuralNetwork particleCount={90} />

      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      <div style={s.content}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <Sparkles size={18} color="#22d3ee" />
            <div style={s.logoRing} />
          </div>
          <span style={s.logoText} className="gradient-text">StudyVerse</span>
        </div>

        <div style={s.welcome}>
          <h1 style={s.title} className="gradient-text-vivid">Welcome Back, {name}</h1>
        </div>

        {/* Animated orb */}
        <div style={s.orbWrap}>
          <div style={s.orbOuter} />
          <div style={s.orbMid} />
          <div style={s.orbInner}>
            <Sparkles size={26} color="#22d3ee" style={{ filter: 'drop-shadow(0 0 10px #22d3ee)' }} />
          </div>
          <div style={s.orbPulse} />
        </div>

        <div style={s.quoteBox}>
          <p style={s.quoteText}>"{quote.text}"</p>
          <p style={s.quoteAuthor}>— {quote.author}</p>
        </div>

        <div style={s.progressWrap}>
          <div style={{ ...s.progressBar, width: `${progress}%` }} />
        </div>
        <p style={s.hint}>Taking you to your dashboard…</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none', animation: 'pulse-glow 4s infinite' },
  orb2: { position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 65%)', pointerEvents: 'none' },
  orb3: { position: 'absolute', top: '20%', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 65%)', pointerEvents: 'none' },
  content: { position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { position: 'relative', width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.25))', border: '1px solid rgba(99,102,241,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 22px rgba(34,211,238,0.35)' },
  logoRing: { position: 'absolute', inset: -3, borderRadius: '15px', border: '1px solid rgba(34,211,238,0.25)', animation: 'pulse-glow 2.5s infinite' },
  logoText: { fontSize: '1.4rem', fontWeight: 900 },
  welcome: { textAlign: 'center' },
  hi: { fontSize: '1.2rem', color: '#7060bb', marginBottom: '8px', fontWeight: 600 },
  nameSpan: { color: '#a78bfa', fontWeight: 900 },
  title: { fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 900, letterSpacing: '-2px' },
  orbWrap: { position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orbOuter: { position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.25)', animation: 'spin-slow 10s linear infinite' },
  orbMid: { position: 'absolute', inset: '14px', borderRadius: '50%', border: '1px solid rgba(34,211,238,0.2)', animation: 'spin-rev 7s linear infinite' },
  orbInner: { width: '74px', height: '74px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), rgba(34,211,238,0.15))', border: '1px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(34,211,238,0.2)', animation: 'pulse-glow 2s infinite' },
  orbPulse: { position: 'absolute', inset: -6, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.15)', animation: 'pulse-ring 2s ease-out infinite' },
  quoteBox: { maxWidth: '420px', padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'rgba(10,8,32,0.8)', border: '1px solid rgba(167,139,250,0.2)', backdropFilter: 'blur(20px)' },
  quoteText: { fontSize: '0.9rem', fontStyle: 'italic', color: '#f0eeff', lineHeight: 1.7, marginBottom: '8px' },
  quoteAuthor: { fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700 },
  progressWrap: { width: '220px', height: '3px', background: 'rgba(167,139,250,0.15)', borderRadius: '999px', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', borderRadius: '999px', transition: 'width 0.06s linear', boxShadow: '0 0 10px rgba(99,102,241,0.6)' },
  hint: { color: '#7060bb', fontSize: '0.8rem' },
}
