'use client'
// app/subjects/page.js
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Plus, Trash2, BookMarked } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = [
  '#6366f1', '#818cf8', '#22d3ee', '#60a5fa', '#3b82f6',
  '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#facc15',
]
const ICONS = ['📚', '🔬', '🧮', '💻', '🎨', '⚗️', '📐', '🌍', '📖', '🎵', '🏛️', '🧬']

export default function SubjectsPage() {
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', color: COLORS[0], icon: '📚', teacher: '', room: '' })
  const subjects = userProfile?.subjects || []

  async function addSubject(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      const updated = [...subjects, { ...form, id: Date.now().toString() }]
      await updateDoc(doc(db, 'users', currentUser.uid), { subjects: updated })
      setUserProfile(p => ({ ...p, subjects: updated }))
      setForm({ name: '', color: COLORS[0], icon: '📚', teacher: '', room: '' })
      setShowForm(false)
      toast.success('Subject added!')
    } catch { toast.error('Failed to add subject') }
  }

  async function deleteSubject(id) {
    const updated = subjects.filter(s => s.id !== id)
    await updateDoc(doc(db, 'users', currentUser.uid), { subjects: updated })
    setUserProfile(p => ({ ...p, subjects: updated }))
    toast.success('Removed')
  }

  return (
    <AppLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Subjects</h1>
            <p style={s.sub}>{subjects.length} courses this semester</p>
          </div>
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            <Plus size={17} /> Add Subject
          </button>
        </div>

        {showForm && (
          <form onSubmit={addSubject} style={s.form} className="glass glow-border">
            <h3 style={s.formTitle}>New Subject</h3>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Subject name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input style={s.input} placeholder="Teacher (optional)" value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} />
              <input style={s.input} placeholder="Room / Location" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
            </div>

            <div style={s.pickerSection}>
              <span style={s.pickerLabel}>Icon</span>
              <div style={s.iconGrid}>
                {ICONS.map(icon => (
                  <button key={icon} type="button" style={{ ...s.iconBtn, background: form.icon === icon ? 'rgba(99,102,241,0.2)' : 'var(--surface3)', border: form.icon === icon ? '1px solid var(--indigo)' : '1px solid var(--border)' }} onClick={() => setForm(f => ({ ...f, icon }))}>{icon}</button>
                ))}
              </div>
            </div>

            <div style={s.pickerSection}>
              <span style={s.pickerLabel}>Color</span>
              <div style={s.colorGrid}>
                {COLORS.map(color => (
                  <button key={color} type="button" style={{ ...s.colorBtn, background: color, outline: form.color === color ? `3px solid ${color}66` : 'none', outlineOffset: '2px' }} onClick={() => setForm(f => ({ ...f, color }))} />
                ))}
              </div>
            </div>

            <div style={s.formActions}>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" style={s.submitBtn}>Add Subject</button>
            </div>
          </form>
        )}

        {subjects.length === 0 ? (
          <div style={s.empty} className="glass">
            <BookMarked size={44} color="var(--text-muted)" style={{ opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No subjects yet. Add your first course!</p>
          </div>
        ) : (
          <div style={s.grid}>
            {subjects.map(sub => (
              <div key={sub.id} style={{ ...s.card, borderTop: `3px solid ${sub.color}` }} className="glass">
                <div style={s.cardTop}>
                  <div style={{ ...s.cardIcon, background: sub.color + '22' }}>{sub.icon}</div>
                  <button style={s.deleteBtn} onClick={() => deleteSubject(sub.id)}><Trash2 size={14} /></button>
                </div>
                <h3 style={s.cardName}>{sub.name}</h3>
                {sub.teacher && <p style={s.cardMeta}>👤 {sub.teacher}</p>}
                {sub.room && <p style={s.cardMeta}>📍 {sub.room}</p>}
                <div style={{ ...s.colorBar, background: `linear-gradient(90deg, ${sub.color}55, transparent)` }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'var(--grad-1)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
  form: { borderRadius: '16px', padding: '1.5rem', marginBottom: '1.75rem' },
  formTitle: { fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' },
  input: { padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' },
  pickerSection: { marginBottom: '1rem' },
  pickerLabel: { fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  iconBtn: { width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  colorGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  colorBtn: { width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', border: 'none', transition: 'all 0.15s' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  submitBtn: { padding: '8px 18px', background: 'var(--grad-1)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' },
  empty: { padding: '4rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' },
  card: { borderRadius: '16px', padding: '1.25rem', position: 'relative', overflow: 'hidden' },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' },
  cardIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' },
  deleteBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.4 },
  cardName: { fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' },
  cardMeta: { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' },
  colorBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px' },
}
