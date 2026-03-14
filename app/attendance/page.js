'use client'
// app/attendance/page.js
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAttendance } from '../../hooks/useFirestore'
import AppLayout from '../../components/layout/AppLayout'
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'var(--cyan)',          icon: CheckCircle2, bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.25)'  },
  absent:  { label: 'Absent',  color: '#f87171',              icon: XCircle,      bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  late:    { label: 'Late',    color: 'var(--blue-electric)', icon: Clock,        bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
}

function pct(records, subjectId) {
  const r = records.filter(r => r.subjectId === subjectId)
  if (!r.length) return null
  const present = r.filter(r => r.status === 'present').length + r.filter(r => r.status === 'late').length * 0.5
  return Math.round((present / r.length) * 100)
}

export default function AttendancePage() {
  const { currentUser, userProfile } = useAuth()
  const { records, markAttendance } = useAttendance(currentUser?.uid)
  const subjects = userProfile?.subjects || []
  const [selected, setSelected] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState('mark') // 'mark' | 'history'

  async function mark(subjectId, status) {
    const existing = records.find(r => r.subjectId === subjectId && r.date === date)
    if (existing) return toast.error('Already marked for this date')
    try {
      await markAttendance({ subjectId, date, status })
      toast.success(`Marked as ${status}`)
    } catch { toast.error('Failed to mark') }
  }

  const subjectRecords = selected ? records.filter(r => r.subjectId === selected).sort((a, b) => b.date.localeCompare(a.date)) : []

  return (
    <AppLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Attendance</h1>
            <p style={s.sub}>Track your class presence and stay above 75%</p>
          </div>
          <div style={s.viewToggle}>
            <button style={{ ...s.toggleBtn, ...(view === 'mark' ? s.toggleActive : {}) }} onClick={() => setView('mark')}>Mark</button>
            <button style={{ ...s.toggleBtn, ...(view === 'history' ? s.toggleActive : {}) }} onClick={() => setView('history')}>History</button>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div style={s.empty} className="glass">
            <AlertTriangle size={40} color="var(--text-muted)" style={{ opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No subjects added yet. Go to Subjects to add courses first.</p>
          </div>
        ) : view === 'mark' ? (
          <>
            <div style={s.dateRow}>
              <span style={s.dateLabel}>Marking attendance for:</span>
              <input style={s.dateInput} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div style={s.subjectGrid}>
              {subjects.map(sub => {
                const attendance = pct(records, sub.id)
                const low = attendance !== null && attendance < 75
                return (
                  <div key={sub.id} style={{ ...s.subCard, borderTop: `3px solid ${sub.color}` }} className="glass">
                    <div style={s.subCardHeader}>
                      <div style={{ ...s.subIcon, background: sub.color + '22' }}>{sub.icon}</div>
                      <div style={s.subInfo}>
                        <div style={s.subName}>{sub.name}</div>
                        {attendance !== null && (
                          <div style={{ ...s.pctBadge, color: low ? '#f87171' : 'var(--cyan)', background: low ? 'rgba(248,113,113,0.1)' : 'rgba(34,211,238,0.1)' }}>
                            {low && <AlertTriangle size={11} />} {attendance}% attendance
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={s.markBtns}>
                      {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                        const already = records.find(r => r.subjectId === sub.id && r.date === date && r.status === status)
                        return (
                          <button key={status} style={{ ...s.markBtn, background: already ? cfg.bg : 'var(--surface3)', color: already ? cfg.color : 'var(--text-muted)', border: `1px solid ${already ? cfg.border : 'var(--border)'}` }} onClick={() => mark(sub.id, status)}>
                            <cfg.icon size={13} /> {cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div style={s.subjectTabs}>
              {subjects.map(sub => (
                <button key={sub.id} style={{ ...s.subTab, background: selected === sub.id ? `${sub.color}22` : 'var(--surface2)', color: selected === sub.id ? sub.color : 'var(--text-muted)', border: `1px solid ${selected === sub.id ? sub.color + '44' : 'var(--border)'}` }} onClick={() => setSelected(sub.id === selected ? null : sub.id)}>
                  {sub.icon} {sub.name}
                </button>
              ))}
            </div>
            {selected && (
              <div style={s.historyTable} className="glass">
                {subjectRecords.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records yet for this subject</div>
                ) : subjectRecords.map((r, i) => {
                  const cfg = STATUS_CONFIG[r.status]
                  return (
                    <div key={r.id} style={{ ...s.histRow, borderBottom: i < subjectRecords.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={s.histDate}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span style={{ ...s.histStatus, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <cfg.icon size={12} /> {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Overall stats */}
        {subjects.length > 0 && (
          <div style={s.statsGrid}>
            {subjects.map(sub => {
              const p = pct(records, sub.id)
              const total = records.filter(r => r.subjectId === sub.id).length
              if (p === null) return null
              return (
                <div key={sub.id} style={s.statCard} className="glass">
                  <div style={s.statHeader}>
                    <span style={s.statIcon}>{sub.icon}</span>
                    <span style={s.statName}>{sub.name}</span>
                    {p < 75 && <AlertTriangle size={14} color="#f87171" />}
                  </div>
                  <div style={s.statBarWrap}>
                    <div style={{ ...s.statBar, width: `${p}%`, background: p < 75 ? 'linear-gradient(90deg,#f87171,#fb923c)' : 'var(--grad-1)' }} />
                  </div>
                  <div style={s.statFooter}>
                    <span style={{ color: p < 75 ? '#f87171' : 'var(--cyan)', fontWeight: 800 }}>{p}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{total} classes</span>
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '780px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  viewToggle: { display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: '10px' },
  toggleBtn: { padding: '6px 16px', borderRadius: '7px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' },
  toggleActive: { background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-bright)' },
  empty: { padding: '3rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  dateRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
  dateLabel: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  dateInput: { padding: '7px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' },
  subjectGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '2rem' },
  subCard: { borderRadius: '16px', padding: '1.25rem' },
  subCardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' },
  subIcon: { width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
  subInfo: { flex: 1 },
  subName: { fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)', marginBottom: '3px' },
  pctBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 },
  markBtns: { display: 'flex', gap: '6px' },
  markBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 4px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  subjectTabs: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' },
  subTab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  historyTable: { borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem' },
  histRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px' },
  histDate: { color: 'var(--text)', fontSize: '0.875rem' },
  histStatus: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' },
  statCard: { borderRadius: '14px', padding: '1rem' },
  statHeader: { display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.75rem' },
  statIcon: { fontSize: '1rem' },
  statName: { flex: 1, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' },
  statBarWrap: { height: '5px', background: 'var(--surface3)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' },
  statBar: { height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' },
  statFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}
