import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Loader2, Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react'

const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  React.useEffect(() => {
    // Check if we are in a reset flow
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('reset-password')) {
      setIsResetting(true)
    }

    // Listen for the session to be established from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetting(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      alert('Password updated successfully! You can now sign in.')
      setIsResetting(false)
      window.location.hash = ''
      window.location.reload() // Reload to clear the session/hash completely
    } catch (err) {
      setError(err.message === 'Auth session missing!' ? 'Session expired. Please request a new reset link.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { redirectTo: window.location.href }
        })
        if (error) throw error
        alert('Check your email for a NEW confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password,
          options: { redirectTo: window.location.href }
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: { emailRedirectTo: window.location.href }
      })
      if (error) throw error
      alert('A new confirmation link has been sent!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/WebClgProject/#reset-password',
      })
      if (error) throw error
      alert('Password reset link has been sent to your email!')
    } catch (err) {
      setError(err.message)
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

      {error && (
        <div className="auth-error">
          <ShieldCheck size={16} /> {error}
        </div>
      )}

      <div className="social-auth">
        <button onClick={handleGoogleLogin} className="btn-social">
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="auth-divider">
        <span>or use email</span>
      </div>

      {isResetting ? (
        <form onSubmit={handleUpdatePassword} className="auth-form">
          <div className="form-group">
            <label><Lock className="field-icon" /> New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
          </button>
        </form>
      ) : (
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
      )}

      <div className="auth-footer">
        {isSignUp ? (
          <button 
            type="button" 
            onClick={handleResendEmail} 
            className="btn-link resend-link" 
            disabled={loading}
            style={{ marginBottom: '1rem', display: 'block', width: '100%' }}
          >
            {loading ? 'Processing...' : "Didn't get the email? Resend"}
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            className="btn-link forgot-link" 
            disabled={loading}
            style={{ marginBottom: '1rem', display: 'block', width: '100%' }}
          >
            {loading ? 'Processing...' : "Forgot your password?"}
          </button>
        )}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="btn-link">
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
        .auth-header { margin-bottom: 2rem; }
        .auth-icon { width: 3rem; height: 3rem; color: var(--primary); margin-bottom: 1rem; }
        
        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .social-auth { margin-bottom: 1.5rem; }
        .btn-social {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          color: var(--text-main);
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-social:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
          transform: translateY(-1px);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .auth-divider span { padding: 0 1rem; }

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
