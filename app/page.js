'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ArrowRight, Brain, Calendar, Zap, BookOpen, Timer, Shield } from 'lucide-react'

const NeuralNetwork = dynamic(() => import('../components/3d/NeuralNetwork'), { ssr: false })

const FEATURES = [
  { icon: Brain,    title: 'Nova AI Assistant',  desc: 'Gemini-powered chatbot that plans, explains, and motivates', color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { icon: Calendar, title: 'Smart Study Plans',   desc: 'AI generates personalized day-by-day exam schedules',        color: '#22d3ee', glow: 'rgba(34,211,238,0.3)'  },
  { icon: Zap,      title: 'AI Flashcards',       desc: 'Generate an entire deck on any topic in seconds',            color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
  { icon: BookOpen, title: 'Smart Notes',          desc: 'Write notes, then let AI summarize and quiz you',            color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { icon: Timer,    title: 'Pomodoro Timer',       desc: 'Stay in deep focus with structured study sessions',          color: '#f472b6', glow: 'rgba(244,114,182,0.3)' },
  { icon: Shield,   title: 'Attendance Tracker',  desc: 'Track classes and get warned before falling below 75%',      color: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
]

export default function HomePage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (currentUser) router.push('/splash')
  }, [currentUser])

  if (!mounted) return null

  return (
    <div style={s.page}>
      <NeuralNetwork particleCount={130} />

      {/* Ambient orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />
      <div style={s.orb4} />

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.logoIcon}>
            <Sparkles size={16} color="#22d3ee" />
            <div style={s.logoRing} />
          </div>
          <span style={s.logoText} className="gradient-text">StudyVerse</span>
        </div>
        <div style={s.navLinks}>
          <Link href="/auth?mode=login" style={s.navLink}>Sign In</Link>
          <Link href="/auth?mode=signup" style={s.navCta} className="btn-shimmer">
            Get Started Free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge} className="animate-fade">
          <div style={s.badgeDot} />
          <span>Powered by Google Gemini 2.5 Flash</span>
        </div>

        <h1 style={s.heroTitle} className="animate-fade">
          Your Personal<br />
          <span className="gradient-text-vivid">Study Universe</span>
        </h1>

        <p style={s.heroSub} className="animate-fade">
          The AI-powered productivity app built for students who want to<br />
          study smarter, not harder. Plan, focus, and ace every exam.
        </p>

        <div style={s.heroBtns} className="animate-fade">
          <Link href="/auth?mode=signup" style={s.primaryBtn} className="btn-shimmer">
            Join for Free <ArrowRight size={17} />
          </Link>
          <Link href="/auth?mode=login" style={s.secondaryBtn}>
            Sign In
          </Link>
        </div>

        <div style={s.heroStats}>
          {[
            { label: 'AI-Powered', sub: 'Study Plans',  color: '#a78bfa' },
            { label: 'Instant',    sub: 'Flashcards',   color: '#22d3ee' },
            { label: 'Real-time',  sub: 'Attendance',   color: '#f472b6' },
            { label: 'Built-in',   sub: 'Pomodoro',     color: '#fbbf24' },
          ].map(({ label, sub, color }) => (
            <div key={sub} style={s.stat}>
              <span style={{ ...s.statA, color }}>{label}</span>
              <span style={s.statB}>{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.features}>
        <h2 style={s.featTitle}>Everything you need to <span className="gradient-text">excel</span></h2>
        <p style={s.featSub}>One app for your entire academic life</p>
        <div style={s.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ ...s.featCard, border: `1px solid ${f.color}22`, boxShadow: `0 0 24px ${f.glow}` }} className="card-hover">
              <div style={{ ...s.featIcon, background: `${f.color}18`, boxShadow: `0 0 16px ${f.glow}` }}>
                <f.icon size={22} color={f.color} style={{ filter: `drop-shadow(0 0 6px ${f.color})` }} />
              </div>
              <h3 style={{ ...s.featCardTitle, color: f.color }}>{f.title}</h3>
              <p style={s.featCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Ready to transform how you study?</h2>
          <p style={s.ctaSub}>Join StudyVerse and let AI handle the planning while you focus on learning.</p>
          <Link href="/auth?mode=signup" style={s.primaryBtn} className="btn-shimmer">
            Start Studying Smarter <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer style={s.footer}>
        <Sparkles size={13} color="#a78bfa" />
        <span>StudyVerse © 2024 — Built for students, powered by AI</span>
      </footer>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflowX: 'hidden' },
  orb1: { position: 'fixed', top: '-250px', right: '-200px', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', bottom: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  orb3: { position: 'fixed', top: '35%', left: '30%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  orb4: { position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 48px)', maxWidth: '900px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 22px', borderRadius: '16px', zIndex: 100, background: 'rgba(6,4,20,0.8)', backdropFilter: 'blur(28px)', border: '1px solid rgba(167,139,250,0.18)', boxShadow: '0 4px 32px rgba(99,102,241,0.1)' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { position: 'relative', width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.25))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(34,211,238,0.3)' },
  logoRing: { position: 'absolute', inset: -3, borderRadius: '13px', border: '1px solid rgba(34,211,238,0.2)', animation: 'pulse-glow 2.5s infinite' },
  logoText: { fontSize: '1.15rem', fontWeight: 900 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '14px' },
  navLink: { color: '#7060bb', fontWeight: 600, fontSize: '0.875rem' },
  navCta: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', borderRadius: '999px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 0 20px rgba(99,102,241,0.4)', position: 'relative', overflow: 'hidden' },
  hero: { position: 'relative', zIndex: 10, textAlign: 'center', padding: '165px 2rem 80px', maxWidth: '820px', margin: '0 auto' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: '999px', fontSize: '0.78rem', color: '#22d3ee', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 0 16px rgba(34,211,238,0.15)' },
  badgeDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'pulse-glow 1.5s infinite' },
  heroTitle: { fontSize: 'clamp(2.8rem, 7vw, 5.2rem)', fontWeight: 900, lineHeight: 1.08, color: '#f0eeff', marginBottom: '1.5rem', letterSpacing: '-2px' },
  heroSub: { fontSize: '1.05rem', color: '#7060bb', lineHeight: 1.85, marginBottom: '2.5rem' },
  heroBtns: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 36px rgba(99,102,241,0.45)', position: 'relative', overflow: 'hidden' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '14px', color: '#a78bfa', fontWeight: 700, fontSize: '1rem' },
  heroStats: { display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statA: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' },
  statB: { fontSize: '0.82rem', color: '#7060bb' },
  features: { position: 'relative', zIndex: 10, padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' },
  featTitle: { fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.75rem', color: '#f0eeff' },
  featSub: { color: '#7060bb', marginBottom: '2.5rem' },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  featCard: { padding: '1.5rem', borderRadius: '18px', textAlign: 'left', background: 'rgba(10,8,32,0.75)', backdropFilter: 'blur(20px)' },
  featIcon: { width: '46px', height: '46px', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  featCardTitle: { fontSize: '0.92rem', fontWeight: 800, marginBottom: '0.5rem' },
  featCardDesc: { fontSize: '0.8rem', color: '#7060bb', lineHeight: 1.65 },
  cta: { position: 'relative', zIndex: 10, padding: '2rem', maxWidth: '680px', margin: '0 auto 4rem' },
  ctaInner: { padding: '3rem', borderRadius: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.07))', border: '1px solid rgba(167,139,250,0.25)', boxShadow: '0 0 60px rgba(99,102,241,0.12)' },
  ctaTitle: { fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', color: '#f0eeff' },
  ctaSub: { color: '#7060bb', marginBottom: '2rem', lineHeight: 1.7 },
  footer: { position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem', color: '#7060bb', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
}
