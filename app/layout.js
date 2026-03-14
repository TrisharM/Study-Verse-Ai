// app/layout.js
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'

export const metadata = {
  title: 'StudyVerse — AI Study Companion',
  description: 'Your AI-powered student productivity universe',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#07071a',
                color: '#eeeeff',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '12px',
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: '0.9rem',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
