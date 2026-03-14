'use client'
// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    const profile = { uid: result.user.uid, displayName, email, subjects: [], streak: 0, createdAt: new Date().toISOString() }
    await setDoc(doc(db, 'users', result.user.uid), profile)
    setUserProfile(profile)
    return result
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const snap = await getDoc(doc(db, 'users', result.user.uid))
    if (!snap.exists()) {
      const profile = { uid: result.user.uid, displayName: result.user.displayName, email: result.user.email, subjects: [], streak: 0, createdAt: new Date().toISOString() }
      await setDoc(doc(db, 'users', result.user.uid), profile)
    }
    return result
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      setCurrentUser(user)
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) setUserProfile(snap.data())
      }
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, setUserProfile, signup, login, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
