'use client'
// hooks/useFirestore.js
import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTasks(uid) {
  const [tasks, setTasks] = useState([])
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'tasks'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [uid])
  const addTask = data => addDoc(collection(db, 'tasks'), { ...data, uid, completed: false, createdAt: serverTimestamp() })
  const updateTask = (id, data) => updateDoc(doc(db, 'tasks', id), data)
  const deleteTask = id => deleteDoc(doc(db, 'tasks', id))
  return { tasks, addTask, updateTask, deleteTask }
}

export function useNotes(uid) {
  const [notes, setNotes] = useState([])
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'notes'), where('uid', '==', uid), orderBy('updatedAt', 'desc'))
    return onSnapshot(q, snap => setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [uid])
  const addNote = data => addDoc(collection(db, 'notes'), { ...data, uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  const updateNote = (id, data) => updateDoc(doc(db, 'notes', id), { ...data, updatedAt: serverTimestamp() })
  const deleteNote = id => deleteDoc(doc(db, 'notes', id))
  return { notes, addNote, updateNote, deleteNote }
}

export function useAttendance(uid) {
  const [records, setRecords] = useState([])
  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'attendance'), where('uid', '==', uid))
    return onSnapshot(q, snap => setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [uid])
  const markAttendance = data => addDoc(collection(db, 'attendance'), { ...data, uid, createdAt: serverTimestamp() })
  return { records, markAttendance }
}
