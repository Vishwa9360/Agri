import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeDemo, setActiveDemo] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password: password,
      })

      const token = response.data
      localStorage.setItem('token', token)
      if (activeDemo) {
        localStorage.setItem('activeRole', activeDemo)
      } else {
        localStorage.removeItem('activeRole')
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('LOGIN ERROR:', err)

      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Invalid credentials or account pending supervisor approval.')
        } else if (err.response.status === 429) {
          setError('Too many failed attempts. Account temporarily locked for 15 minutes.')
        } else {
          setError(`Login failed. Server returned status ${err.response.status}`)
        }
      } else if (err.request) {
        setError('Cannot connect to backend. Please make sure Spring Boot is running on port 8080.')
      } else {
        setError('Login request failed. Please check your network connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCreds = (usr, pwd, roleLabel) => {
    setUsername(usr)
    setPassword(pwd)
    setActiveDemo(roleLabel)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '460px', width: '92%' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.88rem',
              color: '#2e7d32',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            ← Back to AgroSense Home
          </Link>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '2rem',
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2e7d32, #10b981)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 10px rgba(46, 125, 50, 0.25)'
          }}>
            🌾
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#111827', margin: 0 }}>
            Sign In to AgroSense
          </h1>
          <p className="login-subtitle" style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
            Precision Agriculture &amp; Farm Management Portal
          </p>
        </div>

        {/* 1-Click Quick Demo Accounts Bar */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#166534',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>⚡ Quick-Fill Demo Accounts:</span>
            {activeDemo && <span style={{ color: '#047857' }}>Selected: {activeDemo}</span>}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoCreds('farmer', 'Farmer@123', 'Farmer')}
              style={{
                background: activeDemo === 'Farmer' ? '#2e7d32' : 'white',
                color: activeDemo === 'Farmer' ? 'white' : '#166534',
                border: '1px solid #86efac',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🌾 Farmer
            </button>

            <button
              type="button"
              onClick={() => fillDemoCreds('vishwa', 'Vishwa@123', 'Admin')}
              style={{
                background: activeDemo === 'Admin' ? '#b91c1c' : 'white',
                color: activeDemo === 'Admin' ? 'white' : '#991b1b',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ⚡ Admin
            </button>

            <button
              type="button"
              onClick={() => fillDemoCreds('field_officer', 'Officer@123', 'Field Officer')}
              style={{
                background: activeDemo === 'Field Officer' ? '#0369a1' : 'white',
                color: activeDemo === 'Field Officer' ? 'white' : '#075985',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📋 Field Officer
            </button>

            <button
              type="button"
              onClick={() => fillDemoCreds('agri_officer', 'Officer@123', 'Agricultural Officer')}
              style={{
                background: activeDemo === 'Agricultural Officer' ? '#b45309' : 'white',
                color: activeDemo === 'Agricultural Officer' ? 'white' : '#92400e',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🔬 Agri Officer
            </button>

            <button
              type="button"
              onClick={() => fillDemoCreds('guest', 'Guest@123', 'Guest')}
              style={{
                background: activeDemo === 'Guest' ? '#374151' : 'white',
                color: activeDemo === 'Guest' ? 'white' : '#4b5563',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              👤 Guest
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label style={{ fontSize: '0.9rem', color: '#374151' }}>Username or Email</label>
            <input
              type="text"
              placeholder="e.g. farmer or vishwa@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>Password</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: '600' }}
              >
                Forgot Password?
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: '0.85rem',
                  width: 'auto'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.8rem',
              fontSize: '1rem',
              fontWeight: '700',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2e7d32, #10b981)',
              boxShadow: '0 4px 10px rgba(46, 125, 50, 0.25)',
              borderRadius: '8px'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal →'}
          </button>
        </form>

        {/* Registration Link */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#4b5563'
        }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#2e7d32', fontWeight: '700' }}>
            Register here
          </Link>
        </div>

      </div>
    </div>
  )
}
