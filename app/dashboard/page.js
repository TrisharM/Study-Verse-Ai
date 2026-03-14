'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useFirestore'
import AppLayout from '../../components/layout/AppLayout'
import { MessageCircle, CheckSquare, BookOpen, Calendar, Timer, Zap, BookMarked, UserCheck, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Study while others are sleeping.", author: "William A. Ward" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
]

const ACTIONS = [
  { href: '/chat',       icon: MessageCircle, label: 'Ask Nova',    color: '#22d3ee', glow: 'rgba(34,211,238,0.3)',   desc: 'AI study assistant'  },
  { href: '/tasks',      icon: CheckSquare,   label: 'Add Task',    color: '#60a5fa', glow: 'rgba(96,165,250,0.3)',   desc: 'Track assignments'   },
  { href: '/study-plan', icon: Calendar,      label: 'Study Plan',  color: '#a78bfa', glow: 'rgba(167,139,250,0.3)',  desc: 'AI-generated plans'  },
  { href: '/pomodoro',   icon: Timer,         label: 'Focus Timer', color: '#f472b6', glow: 'rgba(244,114,182,0.3)',  desc: 'Pomodoro technique'  },
  { href: '/flashcards', icon: Zap,           label: 'Flashcards',  color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',   desc: 'AI flashcard gen'    },
  { href: '/notes',      icon: BookOpen,      label: 'Notes',       color: '#a78bfa', glow: 'rgba(167,139,250,0.3)',  desc: 'Smart note taking'   },
  { href: '/subjects',   icon: BookMarked,    label: 'Subjects',    color: '#60a5fa', glow: 'rgba(96,165,250,0.3)',   desc: 'Manage courses'      },
  { href: '/attendance', icon: UserCheck,     label: 'Attendance',  color: '#34d399', glow: 'rgba(52,211,153,0.3)',   desc: 'Track presence'      },
]

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth()
  const { tasks } = useTasks(currentUser?.uid)
  const [quote] = useState(() => QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length])
  const name      = userProfile?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Student'
  const pending   = tasks.filter(t => !t.completed).length
  const completed = tasks.filter(t =>  t.completed).length
  const overdue   = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length

  const STATS = [
    { label: 'Pending',  value: pending,                         color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)',   emoji: '📋' },
    { label: 'Done',     value: completed,                       color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)',   emoji: '✅' },
    { label: 'Overdue',  value: overdue,                         color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', emoji: '⚠️' },
    { label: 'Streak',   value: `${userProfile?.streak || 0}d`, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)',   emoji: '🔥' },
  ]

  return (
    <AppLayout>
      <div style={s.page}>

        <div style={s.header}>
          <div>
            <p style={s.greeting}>Good to see you back,</p>
            <h1 style={s.name}>{name} <span className="gradient-text">✨</span></h1>
          </div>
          <div style={s.streakBadge}>
            <TrendingUp size={14} color="#fbbf24" />
            <span style={{ color: '#fbbf24', fontWeight: 900 }}>{userProfile?.streak || 0}</span>
            <span style={{ color: '#7060bb', fontSize: '0.78rem' }}>day streak</span>
          </div>
        </div>

        <div style={s.statsRow}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ ...s.statCard, background: stat.bg, border: `1px solid ${stat.border}`, boxShadow: `0 0 24px ${stat.bg}` }}>
              <div style={s.statEmoji}>{stat.emoji}</div>
              <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <Link href="/chat" style={s.novaBanner}>
          <div style={s.novaOrb}>
            <Sparkles size={20} color="#22d3ee" />
            <div style={s.novaOrbPulse} />
          </div>
          <div style={s.novaText}>
            <div style={s.novaTitle}>Ask Nova anything</div>
            <div style={s.novaSub}>Your AI study companion is ready to help</div>
          </div>
          <ArrowRight size={18} color="#22d3ee" />
        </Link>

        <h2 style={s.sectionTitle}>Quick Actions</h2>
        <div style={s.actionsGrid}>
          {ACTIONS.map(({ href, icon: Icon, label, color, glow, desc }) => (
            <Link key={href} href={href} style={s.actionCard} className="card-hover">
              <div style={{ ...s.actionIcon, background: `${color}18`, boxShadow: `0 0 18px ${glow}` }}>
                <Icon size={20} color={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
              </div>
              <div style={s.actionBody}>
                <div style={{ ...s.actionLabel, color }}>{label}</div>
                <div style={s.actionDesc}>{desc}</div>
              </div>
              <ArrowRight size={13} color={color} style={{ opacity: 0.6, flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        {tasks.length > 0 && (
          <>
            <div style={s.taskHeader}>
              <h2 style={s.sectionTitle}>Recent Tasks</h2>
              <Link href="/tasks" style={s.seeAll}>See all →</Link>
            </div>
            <div style={s.taskList}>
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} style={s.taskRow}>
                  <div style={{ ...s.taskDot, background: t.completed ? '#34d399' : t.priority === 'high' ? '#f87171' : '#a78bfa', boxShadow: `0 0 8px ${t.completed ? '#34d399' : t.priority === 'high' ? '#f87171' : '#a78bfa'}` }} />
                  <span style={{ ...s.taskTitle, textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.35 : 1 }}>{t.title}</span>
                  {t.dueDate && <span style={s.taskDue}>{new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={s.quoteCard}>
          <span style={s.quoteEmoji}>💬</span>
          <div>
            <p style={s.quoteText}>"{quote.text}"</p>
            <p style={s.quoteAuthor}>— {quote.author}</p>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '860px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' },
  greeting: { color: '#7060bb', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2px' },
  name: { fontSize: '2.1rem', fontWeight: 900, color: '#f0eeff' },
  streakBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.22)', borderRadius: '12px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.875rem', marginBottom: '1.5rem' },
  statCard: { padding: '1.25rem', borderRadius: '16px', textAlign: 'center' },
  statEmoji: { fontSize: '1.5rem', marginBottom: '6px' },
  statValue: { fontSize: '1.9rem', fontWeight: 900, lineHeight: 1 },
  statLabel: { color: '#7060bb', fontSize: '0.78rem', marginTop: '5px', fontWeight: 600 },
  novaBanner: { display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(34,211,238,0.28)', borderRadius: '16px', marginBottom: '1.75rem', textDecoration: 'none', boxShadow: '0 0 32px rgba(34,211,238,0.08)', transition: 'all 0.2s' },
  novaOrb: { position: 'relative', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 22px rgba(34,211,238,0.35)', flexShrink: 0 },
  novaOrbPulse: { position: 'absolute', inset: -3, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.25)', animation: 'pulse-glow 2s infinite' },
  novaText: { flex: 1 },
  novaTitle: { fontSize: '0.95rem', fontWeight: 800, color: '#22d3ee' },
  novaSub: { fontSize: '0.78rem', color: '#7060bb', marginTop: '2px' },
  sectionTitle: { fontSize: '0.78rem', fontWeight: 800, color: '#7060bb', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.625rem', marginBottom: '1.75rem' },
  actionCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.875rem 1rem', borderRadius: '14px', textDecoration: 'none', background: 'rgba(10,8,32,0.8)', border: '1px solid rgba(167,139,250,0.1)', backdropFilter: 'blur(20px)', transition: 'all 0.2s' },
  actionIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionBody: { flex: 1 },
  actionLabel: { fontSize: '0.875rem', fontWeight: 800 },
  actionDesc: { fontSize: '0.73rem', color: '#7060bb', marginTop: '2px' },
  taskHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' },
  seeAll: { color: '#a78bfa', fontSize: '0.82rem', fontWeight: 700 },
  taskList: { background: 'rgba(10,8,32,0.8)', border: '1px solid rgba(167,139,250,0.1)', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.75rem' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', borderBottom: '1px solid rgba(167,139,250,0.07)' },
  taskDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  taskTitle: { flex: 1, fontSize: '0.875rem', color: '#f0eeff' },
  taskDue: { fontSize: '0.75rem', color: '#7060bb' },
  quoteCard: { display: 'flex', gap: '14px', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.09), rgba(34,211,238,0.05))', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', marginBottom: '2rem' },
  quoteEmoji: { fontSize: '1.4rem', flexShrink: 0 },
  quoteText: { fontSize: '0.9rem', fontStyle: 'italic', color: '#f0eeff', lineHeight: 1.7 },
  quoteAuthor: { fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700, marginTop: '6px' },
}
