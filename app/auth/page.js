'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '../../context/AuthContext'
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

const NeuralNetwork = dynamic(() => import('../../components/3d/NeuralNetwork'), { ssr: false })

function AuthForm() {
  const params = useSearchParams()
  const [isLogin, setIsLogin] = useState(params.get('mode') !== 'signup')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, signup, loginWithGoogle } = useAuth()
  const router = useRouter()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) { await login(form.email, form.password) }
      else {
        if (!form.name.trim()) return toast.error('Name required')
        await signup(form.email, form.password, form.name.trim())
      }
      router.push('/splash')
    } catch (err) {
      toast.error(err.message?.replace('Firebase: ', '').replace(/\(.*\)/, '').trim() || 'Auth failed')
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setLoading(true)
    try { await loginWithGoogle(); router.push('/splash') }
    catch { toast.error('Google sign-in failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <NeuralNetwork particleCount={90} />
      <div style={s.orb1} /><div style={s.orb2} /><div style={s.orb3} />

      <div style={s.card}>
        <Link href="/" style={s.logoRow}>
          <div style={s.logoIcon}>
            <Sparkles size={17} color="#22d3ee" />
            <div style={s.logoRing} />
          </div>
          <span style={s.logoText} className="gradient-text">StudyVerse</span>
        </Link>

        <h1 style={s.title}>{isLogin ? 'Welcome back 👋' : 'Join StudyVerse ✨'}</h1>
        <p style={s.sub}>{isLogin ? 'Continue your study journey' : 'Start studying smarter today'}</p>

        <button style={s.googleBtn} onClick={handleGoogle} disabled={loading}>
          <Chrome size={16} /> Continue with Google
        </button>

        <div style={s.divider}>
          <div style={s.line} /><span style={s.divText}>or</span><div style={s.line} />
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {!isLogin && (
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <div style={s.inputWrap}>
                <User size={14} style={s.inputIcon} />
                <input style={s.input} type="text" placeholder="Your name" value={form.name} onChange={set('name')} required />
              </div>
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <div style={s.inputWrap}>
              <Mail size={14} style={s.inputIcon} />
              <input style={s.input} type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrap}>
              <Lock size={14} style={s.inputIcon} />
              <input style={{ ...s.input, paddingRight: '40px' }} type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button style={s.submitBtn} type="submit" disabled={loading} className="btn-shimmer">
            {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={s.switchText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button style={s.switchBtn} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', top: '-150px', right: '-150px', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '-150px', left: '-150px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 65%)', pointerEvents: 'none' },
  orb3: { position: 'fixed', top: '40%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 65%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: '420px', padding: '2.25rem', borderRadius: '24px', position: 'relative', zIndex: 10, background: 'rgba(8,6,24,0.88)', backdropFilter: 'blur(32px)', border: '1px solid rgba(167,139,250,0.22)', boxShadow: '0 0 60px rgba(99,102,241,0.12)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem', textDecoration: 'none' },
  logoIcon: { position: 'relative', width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.25))', border: '1px solid rgba(99,102,241,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(34,211,238,0.3)' },
  logoRing: { position: 'absolute', inset: -3, borderRadius: '14px', border: '1px solid rgba(34,211,238,0.2)', animation: 'pulse-glow 2.5s infinite' },
  logoText: { fontSize: '1.25rem', fontWeight: 900 },
  title: { fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', marginBottom: '6px', color: '#f0eeff' },
  sub: { color: '#7060bb', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1.5rem' },
  googleBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '0.75rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)', borderRadius: '12px', color: '#f0eeff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.25rem', transition: 'all 0.2s' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' },
  line: { flex: 1, height: '1px', background: 'rgba(167,139,250,0.12)' },
  divText: { color: '#7060bb', fontSize: '0.78rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.78rem', fontWeight: 700, color: '#7060bb', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '13px', color: '#7060bb', pointerEvents: 'none' },
  input: { width: '100%', padding: '0.75rem 0.75rem 0.75rem 38px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', color: '#f0eeff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' },
  eyeBtn: { position: 'absolute', right: '12px', background: 'transparent', border: 'none', color: '#7060bb', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  submitBtn: { padding: '0.875rem', background: 'linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 0 28px rgba(99,102,241,0.4)', position: 'relative', overflow: 'hidden' },
  switchText: { textAlign: 'center', marginTop: '1.25rem', color: '#7060bb', fontSize: '0.875rem' },
  switchBtn: { background: 'transparent', border: 'none', color: '#a78bfa', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' },
}
