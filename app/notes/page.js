'use client'
// app/notes/page.js
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotes } from '../../hooks/useFirestore'
import AppLayout from '../../components/layout/AppLayout'
import { askGemini } from '../../lib/gemini'
import { Plus, Trash2, Sparkles, Save, X, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotesPage() {
  const { currentUser } = useAuth()
  const { notes, addNote, updateNote, deleteNote } = useNotes(currentUser?.uid)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ title: '', subject: '', content: '' })
  const [editing, setEditing] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  function newNote() {
    setSelected(null)
    setForm({ title: 'Untitled Note', subject: '', content: '' })
    setEditing(true)
    setAiResult(null)
  }

  function openNote(n) {
    setSelected(n)
    setForm({ title: n.title, subject: n.subject || '', content: n.content || '' })
    setEditing(false)
    setAiResult(null)
  }

  async function saveNote() {
    if (!form.title.trim()) return toast.error('Title required')
    try {
      if (selected) { await updateNote(selected.id, form); setSelected({ ...selected, ...form }) }
      else await addNote(form)
      setEditing(false)
      toast.success('Saved!')
    } catch { toast.error('Failed to save') }
  }

  async function aiAction(type) {
    if (!form.content.trim()) return toast.error('Write some content first')
    setAiLoading(true)
    try {
      const prompt = type === 'summarize'
        ? `Summarize this note in 3-5 bullet points, then list 3 key questions to test understanding:\n\nTitle: ${form.title}\n\n${form.content}`
        : `Generate 5 Q&A flashcard pairs from this content. Format each as "Q: ...\nA: ...\n"\n\n${form.content}`
      setAiResult(await askGemini([{ role: 'user', content: prompt }]))
    } catch { toast.error('AI action failed') }
    finally { setAiLoading(false) }
  }

  return (
    <AppLayout>
      <div style={s.page}>
        {/* Sidebar */}
        <div style={s.sidebar} className="glass">
          <div style={s.sidebarHeader}>
            <h2 style={s.sidebarTitle}>Notes</h2>
            <button style={s.newBtn} onClick={newNote}><Plus size={15} /></button>
          </div>
          {notes.length === 0 && !editing ? (
            <div style={s.sidebarEmpty}>
              <BookOpen size={28} color="var(--text-muted)" style={{ opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>No notes yet</p>
              <button style={s.emptyBtn} onClick={newNote}>Create first note</button>
            </div>
          ) : (
            <div style={s.noteList}>
              {notes.map(n => (
                <div key={n.id} style={{ ...s.noteItem, background: selected?.id === n.id ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: selected?.id === n.id ? '2px solid var(--indigo-bright)' : '2px solid transparent' }} onClick={() => openNote(n)}>
                  <div style={s.noteTitle}>{n.title}</div>
                  {n.subject && <div style={s.noteSubject}>{n.subject}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div style={s.editor}>
          {!editing && !selected ? (
            <div style={s.editorEmpty}>
              <BookOpen size={44} color="var(--text-muted)" style={{ opacity: 0.2 }} />
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Select a note or create a new one</p>
              <button style={s.createBtn} onClick={newNote}><Plus size={15} /> New Note</button>
            </div>
          ) : (
            <>
              <div style={s.editorHeader}>
                <div style={s.editorInputs}>
                  <input style={s.titleInput} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title" readOnly={!editing} />
                  <input style={s.subjectInput} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject / Course" readOnly={!editing} />
                </div>
                <div style={s.editorActions}>
                  {!editing ? (
                    <>
                      <button style={s.editBtn} onClick={() => setEditing(true)}>Edit</button>
                      <button style={{ ...s.editBtn, color: '#f87171' }} onClick={() => deleteNote(selected.id).then(() => { setSelected(null); setEditing(false) })}><Trash2 size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button style={s.cancelBtn} onClick={() => { setEditing(false); if (!selected) setForm({ title: '', subject: '', content: '' }) }}><X size={14} /> Cancel</button>
                      <button style={s.saveBtn} onClick={saveNote}><Save size={14} /> Save</button>
                    </>
                  )}
                </div>
              </div>
              <textarea style={{ ...s.textarea, cursor: editing ? 'text' : 'default' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Start writing your notes here…" readOnly={!editing} />
              <div style={s.aiBar}>
                <button style={s.aiBtn} onClick={() => aiAction('summarize')} disabled={aiLoading}><Sparkles size={14} color="var(--indigo-bright)" />{aiLoading ? 'Thinking…' : 'AI Summarize'}</button>
                <button style={s.aiBtn} onClick={() => aiAction('flashcards')} disabled={aiLoading}><Sparkles size={14} color="var(--cyan)" />Generate Flashcards</button>
                <span style={s.wordCount}>{form.content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              {aiResult && (
                <div style={s.aiResult}>
                  <div style={s.aiResultHeader}>
                    <Sparkles size={14} color="var(--indigo-bright)" /><span>Nova's Analysis</span>
                    <button style={s.closeAi} onClick={() => setAiResult(null)}><X size={13} /></button>
                  </div>
                  <div style={s.aiResultText} dangerouslySetInnerHTML={{ __html: aiResult.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

const s = {
  page: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: { width: '240px', flexShrink: 0, borderRight: '1px solid var(--border2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)' },
  sidebarTitle: { fontSize: '0.95rem', fontWeight: 800, margin: 0 },
  newBtn: { width: '30px', height: '30px', borderRadius: '8px', background: 'var(--grad-1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  sidebarEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  emptyBtn: { marginTop: '1rem', padding: '7px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', color: 'var(--indigo-bright)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  noteList: { flex: 1, overflowY: 'auto', padding: '8px' },
  noteItem: { padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '2px' },
  noteTitle: { fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' },
  noteSubject: { fontSize: '0.72rem', color: 'var(--indigo-bright)' },
  editor: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  editorEmpty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  createBtn: { display: 'flex', alignItems: 'center', gap: '7px', marginTop: '1rem', padding: '10px 20px', background: 'var(--grad-1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer' },
  editorHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', gap: '1rem' },
  editorInputs: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  titleInput: { fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', width: '100%' },
  subjectInput: { fontSize: '0.82rem', color: 'var(--indigo-bright)', fontWeight: 600, background: 'transparent', border: 'none', outline: 'none', width: '100%' },
  editorActions: { display: 'flex', alignItems: 'center', gap: '7px' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: 'var(--grad-1)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' },
  textarea: { flex: 1, padding: '1.5rem', resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.8, fontFamily: 'inherit' },
  aiBar: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)' },
  aiBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  wordCount: { marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' },
  aiResult: { margin: '0 1.5rem 1rem', background: 'var(--surface2)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', overflow: 'hidden' },
  aiResultHeader: { display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 13px', borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.08)', color: 'var(--indigo-bright)', fontSize: '0.82rem', fontWeight: 700 },
  closeAi: { marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' },
  aiResultText: { padding: '1rem 1.25rem', color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.7 },
}
