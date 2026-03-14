'use client'
// app/tasks/page.js
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useFirestore'
import AppLayout from '../../components/layout/AppLayout'
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Flag } from 'lucide-react'
import toast from 'react-hot-toast'

const PRIORITY_COLOR = { high: '#f87171', medium: 'var(--blue-electric)', low: 'var(--cyan)' }
const FILTERS = ['all', 'pending', 'completed', 'overdue']

export default function TasksPage() {
  const { currentUser } = useAuth()
  const { tasks, addTask, updateTask, deleteTask } = useTasks(currentUser?.uid)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', priority: 'medium', notes: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    if (filter === 'overdue') return !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    return true
  })

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      await addTask(form)
      setForm({ title: '', subject: '', dueDate: '', priority: 'medium', notes: '' })
      setShowForm(false)
      toast.success('Task added!')
    } catch { toast.error('Failed to add task') }
  }

  const isOverdue = t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()

  return (
    <AppLayout>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Tasks & Assignments</h1>
            <p style={s.sub}>{tasks.filter(t => !t.completed).length} pending · {tasks.filter(t => t.completed).length} completed</p>
          </div>
          <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
            <Plus size={17} /> Add Task
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} style={s.form} className="glass glow-border">
            <h3 style={s.formTitle}>New Task</h3>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Task title *" value={form.title} onChange={set('title')} required />
              <input style={s.input} placeholder="Subject / Course" value={form.subject} onChange={set('subject')} />
              <input style={s.input} type="date" value={form.dueDate} onChange={set('dueDate')} />
              <select style={s.input} value={form.priority} onChange={set('priority')}>
                <option value="low">🟢 Low priority</option>
                <option value="medium">🔵 Medium priority</option>
                <option value="high">🔴 High priority</option>
              </select>
            </div>
            <textarea style={s.textarea} placeholder="Notes (optional)" value={form.notes} onChange={set('notes')} rows={2} />
            <div style={s.formActions}>
              <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" style={s.submitBtn}>Add Task</button>
            </div>
          </form>
        )}

        <div style={s.filters}>
          {FILTERS.map(f => (
            <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={s.filterCount}>
                {f === 'all' ? tasks.length : f === 'pending' ? tasks.filter(t => !t.completed).length : f === 'completed' ? tasks.filter(t => t.completed).length : tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length}
              </span>
            </button>
          ))}
        </div>

        <div style={s.list}>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: 'var(--text-muted)' }}>No tasks here. Add one above!</p>
            </div>
          ) : filtered.map(task => (
            <div key={task.id} style={{ ...s.taskCard, borderLeft: `3px solid ${PRIORITY_COLOR[task.priority] || 'var(--border2)'}`, opacity: task.completed ? 0.55 : 1 }} className="glass">
              <button style={s.checkBtn} onClick={() => updateTask(task.id, { completed: !task.completed })}>
                {task.completed ? <CheckCircle2 size={21} color="var(--cyan)" /> : <Circle size={21} color="var(--text-muted)" />}
              </button>
              <div style={s.taskBody}>
                <div style={s.taskTop}>
                  <span style={{ ...s.taskTitle, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
                  {isOverdue(task) && <span style={s.overdueBadge}>⚠️ Overdue</span>}
                </div>
                <div style={s.taskMeta}>
                  {task.subject && <span style={s.chip}>{task.subject}</span>}
                  {task.dueDate && (
                    <span style={{ ...s.chip, color: isOverdue(task) ? '#f87171' : 'var(--text-muted)' }}>
                      <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <span style={{ ...s.chip, color: PRIORITY_COLOR[task.priority] }}>
                    <Flag size={11} /> {task.priority}
                  </span>
                </div>
                {task.notes && <p style={s.taskNotes}>{task.notes}</p>}
              </div>
              <button style={s.deleteBtn} onClick={() => deleteTask(task.id).then(() => toast.success('Deleted'))}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: '780px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: 900, marginBottom: '4px' },
  sub: { color: 'var(--text-muted)', fontSize: '0.875rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: 'var(--grad-1)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
  form: { borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' },
  input: { padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', width: '100%' },
  textarea: { width: '100%', padding: '0.7rem 1rem', background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.875rem', resize: 'vertical', outline: 'none', marginBottom: '1rem' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  submitBtn: { padding: '8px 18px', background: 'var(--grad-1)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '999px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  filterActive: { background: 'rgba(99,102,241,0.12)', borderColor: 'var(--indigo)', color: 'var(--indigo-bright)' },
  filterCount: { background: 'var(--surface3)', borderRadius: '999px', padding: '1px 7px', fontSize: '0.72rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  empty: { textAlign: 'center', padding: '4rem 2rem' },
  taskCard: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0.875rem 1rem 0.875rem 0.75rem', borderRadius: '12px', transition: 'opacity 0.2s' },
  checkBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 },
  taskBody: { flex: 1 },
  taskTop: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' },
  taskTitle: { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' },
  overdueBadge: { fontSize: '0.72rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: '999px' },
  taskMeta: { display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' },
  chip: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--surface3)', padding: '2px 8px', borderRadius: '999px' },
  taskNotes: { color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '5px' },
  deleteBtn: { background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.4, flexShrink: 0 },
}
