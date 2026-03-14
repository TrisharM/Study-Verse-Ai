'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, MessageCircle, CheckSquare, BookOpen, Calendar,
  Timer, Zap, BookMarked, UserCheck, LogOut, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const NeuralNetwork = dynamic(() => import('../3d/NeuralNetwork'), { ssr: false })

const NAV = [
  { path: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  { path: '/chat',       icon: MessageCircle,   label: 'Nova AI',     color: '#22d3ee', glow: 'rgba(34,211,238,0.4)'  },
  { path: '/tasks',      icon: CheckSquare,     label: 'Tasks',       color: '#60a5fa', glow: 'rgba(96,165,250,0.4)'  },
  { path: '/notes',      icon: BookOpen,        label: 'Notes',       color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  { path: '/study-plan', icon: Calendar,        label: 'Study Plan',  color: '#22d3ee', glow: 'rgba(34,211,238,0.4)'  },
  { path: '/pomodoro',   icon: Timer,           label: 'Focus Timer', color: '#f472b6', glow: 'rgba(244,114,182,0.4)' },
  { path: '/flashcards', icon: Zap,             label: 'Flashcards',  color: '#fbbf24', glow: 'rgba(251,191,36,0.4)'  },
  { path: '/subjects',   icon: BookMarked,      label: 'Subjects',    color: '#60a5fa', glow: 'rgba(96,165,250,0.4)'  },
  { path: '/attendance', icon: UserCheck,       label: 'Attendance',  color: '#34d399', glow: 'rgba(52,211,153,0.4)'  },
]

export default function AppLayout({ children }) {
  const { currentUser, userProfile, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    try { await logout(); router.push('/') }
    catch { toast.error('Logout failed') }
  }

  const initial = userProfile?.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'S'
  const name = userProfile?.displayName || currentUser?.email?.split('@')[0] || 'Student'

  return (
    <div style={s.root}>
      <div style={s.bgParticles}><NeuralNetwork particleCount={70} /></div>

      <aside style={{ ...s.sidebar, width: collapsed ? '68px' : '230px' }}>
        <div style={s.sidebarInner}>

          <div style={s.logoRow}>
            {!collapsed && (
              <div style={s.logo}>
                <div style={s.logoIcon}>
                  <Sparkles size={15} color="#22d3ee" />
                  <div style={s.logoRing} />
                </div>
                <span style={s.logoText} className="gradient-text">StudyVerse</span>
              </div>
            )}
            <button style={s.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {!collapsed ? (
            <div style={s.userCard}>
              <div style={s.avatarWrap}>
                <div style={s.avatar}>{initial}</div>
                <div style={s.avatarRing} />
              </div>
              <div style={s.userInfo}>
                <div style={s.userName}>{name}</div>
                <div style={s.userStreak}>🔥 {userProfile?.streak || 0} day streak</div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', margin: '8px auto', width: 36 }}>
              <div style={{ ...s.avatar, width: 36, height: 36, fontSize: '0.8rem' }}>{initial}</div>
            </div>
          )}

          <nav style={s.nav}>
            {NAV.map(({ path, icon: Icon, label, color, glow }) => {
              const active = pathname === path
              return (
                <Link key={path} href={path} title={collapsed ? label : undefined} style={{
                  ...s.navLink,
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : '#7060bb',
                  borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                  boxShadow: active ? `inset 0 0 24px ${color}12, 0 0 14px ${glow}` : 'none',
                }}>
                  <Icon size={17} style={{ filter: active ? `drop-shadow(0 0 7px ${color})` : 'none', flexShrink: 0, transition: 'filter 0.2s' }} />
                  {!collapsed && <span>{label}</span>}
                  {active && !collapsed && <div style={{ ...s.dot, background: color, boxShadow: `0 0 10px ${color}` }} />}
                </Link>
              )
            })}
          </nav>

          <button style={s.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={15} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  )
}

const s = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', position: 'relative' },
  bgParticles: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 },
  sidebar: { position: 'relative', zIndex: 20, flexShrink: 0, background: 'rgba(6,4,20,0.94)', backdropFilter: 'blur(32px)', borderRight: '1px solid rgba(167,139,250,0.15)', boxShadow: '4px 0 48px rgba(99,102,241,0.1)', transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', overflow: 'hidden' },
  sidebarInner: { display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 10px', gap: '4px', overflowY: 'auto', overflowX: 'hidden' },
  logoRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 14px', borderBottom: '1px solid rgba(167,139,250,0.1)', marginBottom: '8px' },
  logo: { display: 'flex', alignItems: 'center', gap: '9px' },
  logoIcon: { position: 'relative', width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(34,211,238,0.25))', border: '1px solid rgba(99,102,241,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(34,211,238,0.3)' },
  logoRing: { position: 'absolute', inset: -3, borderRadius: '13px', border: '1px solid rgba(34,211,238,0.25)', animation: 'pulse-glow 2.5s infinite' },
  logoText: { fontSize: '1.05rem', fontWeight: 900, whiteSpace: 'nowrap' },
  collapseBtn: { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#7060bb', padding: '5px', borderRadius: '7px', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.07))', border: '1px solid rgba(167,139,250,0.22)', borderRadius: '12px', marginBottom: '8px' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#fff', boxShadow: '0 0 18px rgba(99,102,241,0.55)' },
  avatarRing: { position: 'absolute', inset: -2, borderRadius: '50%', border: '1px solid rgba(167,139,250,0.5)', animation: 'pulse-glow 3s infinite' },
  userInfo: { overflow: 'hidden' },
  userName: { fontSize: '0.82rem', fontWeight: 800, color: '#f0eeff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userStreak: { fontSize: '0.7rem', color: '#7060bb', marginTop: '2px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navLink: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700, transition: 'all 0.18s', textDecoration: 'none', whiteSpace: 'nowrap', position: 'relative' },
  dot: { width: '5px', height: '5px', borderRadius: '50%', marginLeft: 'auto', flexShrink: 0 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', background: 'transparent', border: 'none', color: '#7060bb', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', marginTop: 'auto', width: '100%' },
  main: { flex: 1, overflow: 'auto', position: 'relative', zIndex: 10 },
}
