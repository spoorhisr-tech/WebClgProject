import React, { useState, useEffect } from 'react'
import { Car, Calendar, User, Phone, ShieldCheck, Zap, LogOut } from 'lucide-react'
import { supabase } from './lib/supabaseClient'
import BookingForm from './components/BookingForm'
import BookingList from './components/BookingList'
import Auth from './components/Auth'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    // Check if we are in a recovery flow on mount
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=')) {
      setIsRecovery(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = () => {
    supabase.auth.signOut()
    setIsRecovery(false)
  }

  if (!session || isRecovery) {
    return (
      <div className="app-wrapper">
        <header className="header glass-panel">
          <nav className="container">
            <div className="logo">Drive<span>Sync</span></div>
          </nav>
        </header>
        <Auth onRecoveryComplete={() => setIsRecovery(false)} />
      </div>
    )
  }

  return (
    <div className="app-wrapper">
      <header className="header glass-panel">
        <nav className="container">
          <div className="logo">
            Drive<span>Sync</span>
          </div>
          <div className="nav-links">
            <span className="user-email">
              {session.user.email === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@drivesync.com') ? (
                <span className="admin-badge">System Admin</span>
              ) : (
                session.user.email
              )}
            </span>
            <button onClick={handleSignOut} className="btn-icon">
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-badge">Authenticated Portal</div>
            <h1>Precision Service for <span>Elite Performance</span></h1>
            <p>Welcome back! Schedule your next service or track your active maintenance below.</p>
          </div>
        </section>

        <section id="book-now" className="container main-grid">
          <div className="glass-panel card booking-section">
            <div className="section-header">
              <h2>Schedule Service</h2>
              <p>Secure your spot in our premium service bay.</p>
            </div>
            <BookingForm user={session.user} />
          </div>

          <aside className="info-panels">
            <div className="glass-panel info-card">
              <ShieldCheck className="icon" />
              <h3>Secure Account</h3>
              <p>Your bookings are private and tied securely to your account.</p>
            </div>
            <div className="glass-panel info-card">
              <Zap className="icon" />
              <h3>Priority Status</h3>
              <p>Authenticated users receive 24h priority diagnostic reports.</p>
            </div>
          </aside>
        </section>

        <section id="bookings" className="container bookings-display">
          <div className="section-header">
            <h2>Your Bookings</h2>
            <p>History and live status of your maintenance appointments.</p>
          </div>
          <BookingList user={session.user} />
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 DriveSync Systems. Powered by Supabase Auth.</p>
        </div>
      </footer>

      <style>{`
        .user-email { font-size: 0.875rem; color: var(--text-muted); }
        .admin-badge { 
          background: rgba(14, 165, 233, 0.15); 
          color: #38bdf8; 
          padding: 0.25rem 0.75rem; 
          border-radius: 9999px; 
          font-weight: 600; 
          font-size: 0.75rem;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .btn-icon { background: none; color: var(--text-muted); display: flex; align-items: center; }
        .btn-icon:hover { color: var(--text-main); }
      `}</style>
    </div>
  )
}

export default App
