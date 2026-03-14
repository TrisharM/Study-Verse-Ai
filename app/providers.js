'use client'
// app/providers.js
import { AuthProvider } from '../context/AuthContext'

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
