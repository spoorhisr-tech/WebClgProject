import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react'

const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container glass-panel">
      <div className="auth-header">
        {isSignUp ? <UserPlus className="auth-icon" /> : <LogIn className="auth-icon" />}
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p>{isSignUp ? 'Join DriveSync today' : 'Sign in to manage bookings'}</p>
      </div>

      <form onSubmit={handleAuth} className="auth-form">
        <div className="form-group">
          <label><Mail className="field-icon" /> Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label><Lock className="field-icon" /> Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="btn-primary auth-btn" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="auth-footer">
        <button onClick={() => setIsSignUp(!isSignUp)} className="btn-link">
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>

      <style>{`
        .auth-container {
          max-width: 400px;
          margin: 4rem auto;
          padding: 3rem;
          text-align: center;
        }
        .auth-header { margin-bottom: 2.5rem; }
        .auth-icon { width: 3rem; height: 3rem; color: var(--primary); margin-bottom: 1rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.5rem; text-align: left; }
        .field-icon { width: 14px; height: 14px; display: inline; margin-right: 4px; vertical-align: middle; }
        .auth-btn { width: 100%; margin-top: 1rem; display: flex; justify-content: center; }
        .auth-footer { margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem; }
        .btn-link { background: none; color: var(--accent); font-size: 0.875rem; }
        .btn-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}

export default Auth
