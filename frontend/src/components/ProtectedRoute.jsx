import { useState } from 'react'
import { Navigate } from 'react-router-dom'

function parseToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      return JSON.parse(atob(parts[1]))
    }
  } catch (e) {
    console.error('Token validation error:', e)
  }
  return null
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const [currentTime] = useState(() => Math.floor(Date.now() / 1000))
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const payload = parseToken(token)

  if (payload && payload.exp && payload.exp < currentTime) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const activeRole = localStorage.getItem('activeRole')
    const tokenRole = payload?.role || localStorage.getItem('role') || ''
    const effectiveRole = (activeRole || tokenRole).toUpperCase().replace(/^STRING_?/, '').replace(/^ROLE_/, '')
    const isAllowed = allowedRoles.some(r => effectiveRole.includes(r.toUpperCase()) || r.toUpperCase() === effectiveRole)
    if (!isAllowed) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#dc2626' }}>403 - Access Denied</h2>
          <p>Your current role (<strong>{effectiveRole || 'UNAUTHORIZED'}</strong>) is not authorized to access this administrative module.</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>
            To access this page, please log in with an Administrator account (e.g. <code>vishwa</code> / <code>admin</code>) or switch your role to <strong>Admin</strong> using the role switcher in the topbar.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/dashboard" style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>Return to Dashboard</a>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('activeRole'); window.location.href = '/login'; }} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Log in as Admin</button>
          </div>
        </div>
      )
    }
  }

  return children
}
