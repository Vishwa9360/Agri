import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Layout.css'

const DEFAULT_NOTIFICATIONS = [
  { id: 1, notificationType: 'SENSOR_ALERT', message: 'Soil moisture dropped below 30% in North Field. Automated drip irrigation triggered.', createdTime: '2026-09-04T18:00:00Z', isRead: false },
  { id: 2, notificationType: 'PEST_ALERT', message: 'High humidity detected. Preventive bio-fungicide recommended for Basmati Rice.', createdTime: '2026-09-04T17:00:00Z', isRead: false },
  { id: 3, notificationType: 'IRRIGATION_REMINDER', message: 'Evening precision irrigation cycle scheduled for Sector 3 at 18:30.', createdTime: '2026-09-04T16:00:00Z', isRead: false },
  { id: 4, notificationType: 'CROP_ACTIVITY', message: 'Basmati Rice has entered the vegetative tillering phase (Day 35).', createdTime: '2026-09-03T10:00:00Z', isRead: true },
  { id: 5, notificationType: 'SYSTEM', message: 'AgroSense telemetry gateway connected and synchronized with satellite feeds.', createdTime: '2026-09-02T08:00:00Z', isRead: true }
]

function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [username, setUsername] = useState('Farmer')
  const [role, setRole] = useState('Farmer')

  // Operator Role Switch Authentication Modal States
  const [showRoleAuthModal, setShowRoleAuthModal] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [showAuthPassword, setShowAuthPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Notification States
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const unreadCount = notifications.filter(n => !n.isRead).length

  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('activeRole')
      if (savedRole) {
        setRole(savedRole)
      }

      const token = localStorage.getItem('token')
      if (token) {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          if (payload.sub || payload.username) {
            setUsername(payload.sub || payload.username)
          }
          if (payload.role && !savedRole) {
            setRole(payload.role)
          }
        }
      }
    } catch (e) {
      console.error('Error parsing token:', e)
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await api.get('/api/notifications', { headers })
        if (res.data && res.data.length > 0) {
          setNotifications(res.data)
        }
      } catch (e) {
        console.debug('Failed to load initial notifications:', e)
      }
    }
    fetchNotifications()

    // Real-time WebSocket notification listener (SRS Section 11)
    let ws = null
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      ws = new WebSocket(`${wsProtocol}//${window.location.hostname || 'localhost'}:8080/ws`)
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data && data.message) {
            setNotifications(prev => [data, ...prev])
          }
        } catch {
          // Ignore non-JSON socket frames
        }
      }
    } catch (wsErr) {
      console.debug('WebSocket fallback notice:', wsErr)
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)))
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await api.put(`/api/notifications/${id}/read`, {}, { headers })
    } catch (e) {
      console.debug('Could not mark notification as read:', e)
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await api.put('/api/notifications/read-all', {}, { headers })
    } catch (e) {
      console.debug('Could not mark all notifications as read:', e)
    }
  }
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])
 useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Toggle Sidebar Handler
  const toggleSidebar = () => {
    if (window.innerWidth <= 800) {
      setIsMobileOpen((prev) => !prev)
    } else {
      setIsCollapsed((prev) => {
        const nextState = !prev
        localStorage.setItem('sidebarCollapsed', String(nextState))
        return nextState
      })
    }
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false)
  }

  const handleRoleSelect = (newRole) => {
    if (newRole === role) return
    setTargetRole(newRole)
    setAuthError('')
    
    // Suggest default demo credentials for user convenience
    if (newRole === 'Farmer') {
      setAuthUsername('farmer')
      setAuthPassword('Farmer@123')
    } else if (newRole === 'Admin') {
      setAuthUsername('vishwa')
      setAuthPassword('Vishwa@123')
    } else if (newRole === 'Field Officer') {
      setAuthUsername('field_officer')
      setAuthPassword('Officer@123')
    } else if (newRole === 'Agricultural Officer') {
      setAuthUsername('agri_officer')
      setAuthPassword('Officer@123')
    } else if (newRole === 'Guest') {
      setAuthUsername('guest')
      setAuthPassword('Guest@123')
    } else {
      setAuthUsername('')
      setAuthPassword('')
    }
    setShowRoleAuthModal(true)
  }

  const confirmRoleSwitch = async (e) => {
    if (e) e.preventDefault()
    if (!authUsername.trim() || !authPassword) {
      setAuthError('Please enter both ID/Username and Password.')
      return
    }
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await api.post('/auth/login', {
        username: authUsername.trim(),
        password: authPassword,
      })

      const newToken = response.data
      let tokenRole = ''
      try {
        const parts = newToken.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          tokenRole = (payload.role || '').toUpperCase().replace(/^STRING_?/, '').replace(/^ROLE_/, '')
        }
      } catch (err) {
        console.error('Token parse error:', err)
      }

      // Check role compatibility
      const targetNormalized = targetRole.toUpperCase().replace(/\s+/g, '_')
      const isMatch = tokenRole === targetNormalized || 
                      tokenRole.includes(targetNormalized) || 
                      targetNormalized.includes(tokenRole) || 
                      tokenRole === 'ADMIN'

      if (!isMatch && tokenRole) {
        setAuthError(`Credentials are valid for role '${tokenRole}', but this does not match requested target role '${targetRole}'. Please enter credentials for ${targetRole}.`)
        setAuthLoading(false)
        return
      }

      // Save credentials & activeRole
      localStorage.setItem('token', newToken)
      localStorage.setItem('activeRole', targetRole)
      setRole(targetRole)
      setUsername(authUsername.trim())
      setShowRoleAuthModal(false)

      setToastMessage(`✅ Operator switched to ${targetRole} successfully!`)

      // Briefly notify and refresh so all components re-render with new operator context
      setTimeout(() => {
        window.location.reload()
      }, 600)

    } catch (err) {
      console.error('Operator switch authentication failed:', err)
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setAuthError('Authentication failed: Invalid ID/username or password for this operator role.')
        } else if (err.response.status === 429) {
          setAuthError('Too many failed attempts. Account temporarily locked for 15 minutes.')
        } else {
          setAuthError(`Server error (${err.response.status}). Could not verify credentials.`)
        }
      } else {
        setAuthError('Cannot connect to backend server. Please check that Spring Boot is running on port 8080.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const cancelRoleSwitch = () => {
    setShowRoleAuthModal(false)
    setTargetRole('')
    setAuthError('')
    setAuthUsername('')
    setAuthPassword('')
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await api.post('/api/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } })
      }
    } catch (e) {
      console.debug('Logout API notification error:', e)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('activeRole')
    localStorage.removeItem('sidebarCollapsed')
    navigate('/login')
  }

  // Permission Matrix check per SRS Appendix A
  const canViewFarms = role !== 'Guest'
  const canPlanCrops = role === 'Farmer' || role === 'Agricultural Officer' || role === 'Admin'
  const canViewSensors = role !== 'Guest'
  const canOperate = role !== 'Guest'
  const canViewReports = role !== 'Guest'
  const canManageUsers = role === 'Admin'

  return (
    <div
      className={`dashboard-page ${
        isCollapsed ? 'sidebar-collapsed' : ''
      } ${isMobileOpen ? 'mobile-open' : ''}`}
    >

      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className="sidebar-backdrop"
        onClick={closeMobileSidebar}
        title="Click outside to close menu"
      />

      {/* =========================
          LEFT SIDEBAR
      ========================= */}
      <aside className="sidebar">

        {/* Brand Header */}
        <div className="logo-section">
          <div
            className="logo-brand"
            onClick={isCollapsed ? toggleSidebar : undefined}
            style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
            title={isCollapsed ? 'Click to expand sidebar' : 'Smart Farming Management System'}
          >
            <div className="logo-icon">🌿</div>

            {!isCollapsed && (
              <div className="brand-text">
                <h2>Smart Farming</h2>
                <span>Management System</span>
              </div>
            )}
          </div>

          {/* Top-Left Hamburger / Menu Toggle Button */}
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="sidebar-menu">

          <p className="menu-title">MAIN</p>

          <Link
            to="/dashboard"
            className={`menu-item ${
              location.pathname === '/dashboard' ? 'active' : ''
            }`}
            title="Dashboard"
          >
            <span className="menu-icon">▦</span>
            <span className="menu-label">Dashboard</span>
          </Link>

          {canViewFarms && (
            <Link
              to="/farm-management"
              className={`menu-item ${
                location.pathname === '/farm-management' ? 'active' : ''
              }`}
              title="Farm Management"
            >
              <span className="menu-icon">🌾</span>
              <span className="menu-label">Farm Management</span>
            </Link>
          )}

          {canPlanCrops && (
            <Link
              to="/crop-planning"
              className={`menu-item ${
                location.pathname === '/crop-planning' ? 'active' : ''
              }`}
              title="Crop Planning"
            >
              <span className="menu-icon">🌱</span>
              <span className="menu-label">Crop Planning</span>
            </Link>
          )}

          {canViewSensors && (
            <Link
              to="/iot-monitoring"
              className={`menu-item ${
                location.pathname === '/iot-monitoring' ? 'active' : ''
              }`}
              title="IoT Monitoring"
            >
              <span className="menu-icon">📡</span>
              <span className="menu-label">IoT Monitoring</span>
            </Link>
          )}

          {canOperate && (
            <>
              <p className="menu-title">OPERATIONS</p>

              <Link
                to="/irrigation"
                className={`menu-item ${
                  location.pathname === '/irrigation' ? 'active' : ''
                }`}
                title="Irrigation"
              >
                <span className="menu-icon">💧</span>
                <span className="menu-label">Irrigation</span>
              </Link>

              <Link
                to="/fertilizer"
                className={`menu-item ${
                  location.pathname === '/fertilizer' ? 'active' : ''
                }`}
                title="Fertilizer"
              >
                <span className="menu-icon">🧪</span>
                <span className="menu-label">Fertilizer</span>
              </Link>

              <Link
                to="/pest-disease"
                className={`menu-item ${
                  location.pathname === '/pest-disease' ? 'active' : ''
                }`}
                title="Pest & Disease"
              >
                <span className="menu-icon">🐛</span>
                <span className="menu-label">Pest & Disease</span>
              </Link>

              <Link
                to="/drone-monitoring"
                className={`menu-item ${
                  location.pathname === '/drone-monitoring' ? 'active' : ''
                }`}
                title="Drone Monitoring"
              >
                <span className="menu-icon">🚁</span>
                <span className="menu-label">Drone Monitoring</span>
              </Link>
            </>
          )}

          <p className="menu-title">ANALYTICS & MARKET</p>

          {canViewReports && (
            <Link
              to="/analytics"
              className={`menu-item ${
                location.pathname === '/analytics' ? 'active' : ''
              }`}
              title="Reports & Analytics"
            >
              <span className="menu-icon">📊</span>
              <span className="menu-label">Reports & Analytics</span>
            </Link>
          )}

          <Link
            to="/market-prices"
            className={`menu-item ${
              location.pathname === '/market-prices' ? 'active' : ''
            }`}
            title="Market Prices"
          >
            <span className="menu-icon">💰</span>
            <span className="menu-label">Market Prices</span>
          </Link>

          <Link
            to="/documents"
            className={`menu-item ${
              location.pathname === '/documents' ? 'active' : ''
            }`}
            title="Farm Documents"
          >
            <span className="menu-icon">📑</span>
            <span className="menu-label">Farm Documents</span>
          </Link>

          {canManageUsers && (
            <>
              <p className="menu-title">ADMINISTRATION</p>
              <Link
                to="/admin"
                className={`menu-item ${
                  location.pathname === '/admin' ? 'active' : ''
                }`}
                title="Admin Control & Audit"
              >
                <span className="menu-icon">🛡️</span>
                <span className="menu-label">Admin & Audit</span>
              </Link>
            </>
          )}

        </nav>

        {/* User Profile Section */}
        <div className="user-section">
          <div
            className="user-avatar"
            title={`${username} (${role})`}
          >
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="user-info">
            <strong>{username}</strong>
            <span>● {role}</span>
          </div>
        </div>

      </aside>


      {/* =========================
          MAIN CONTENT AREA
      ========================= */}
      <main className="main-content">

        {/* Top Bar */}
        <header className="topbar">

          <div className="topbar-left">
            {/* Topbar Hamburger Menu Toggle */}
            <button
              type="button"
              className="topbar-hamburger-btn"
              onClick={toggleSidebar}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="search-box">
              🔍
              <input
                type="text"
                placeholder="Search farms, crops, reports..."
              />
            </div>
          </div>

          <div className="topbar-actions">

            {/* SRS Role Switcher for Interactive RBAC Testing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Role:
              </span>
              <select
                value={role}
                onChange={(e) => handleRoleSelect(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #10b981',
                  background: '#f0fdf4',
                  color: '#065f46',
                  fontWeight: '600',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="Farmer">👨‍🌾 Farmer</option>
                <option value="Field Officer">📋 Field Officer</option>
                <option value="Agricultural Officer">🔬 Agricultural Officer</option>
                <option value="Admin">⚡ System Administrator</option>
                <option value="Guest">👤 Guest (Read-Only)</option>
              </select>
            </div>

            {/* Notification Bell & Dropdown */}
            <div className="notif-container">
              <button
                className="icon-button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                title="Notifications"
                style={{ position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications ({unreadCount} unread)</h4>
                    {unreadCount > 0 && (
                      <button className="mark-read-btn" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          <div className="notif-item-icon">
                            {n.notificationType === 'SENSOR_ALERT' ? '📡' :
                             n.notificationType === 'PEST_ALERT' ? '🐛' :
                             n.notificationType === 'IRRIGATION_REMINDER' ? '💧' :
                             n.notificationType === 'CROP_ACTIVITY' ? '🌱' : '⚡'}
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-title">{n.notificationType?.replace('_', ' ')}</div>
                            <p className="notif-item-msg">{n.message}</p>
                            <span className="notif-item-time">
                              {n.createdTime ? new Date(n.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SRS Appendix I Logout button */}
            <button
              onClick={handleLogout}
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Logout session"
            >
              🚪 Logout
            </button>

          </div>

        </header>
 
        {!isOnline && (
          <div style={{
            background: '#fffbeb',
            color: '#92400e',
            borderBottom: '1px solid #fde68a',
            padding: '8px 24px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>Offline Mode Active — You are browsing cached agro-telemetry. Mutations will sync upon reconnection.</span>
          </div>
        )}

        {/* Page Content */}
        {children}

        {/* SRS Section 36 Standard Footer */}
        <footer
          className="dashboard-footer"
          style={{
            marginTop: '40px',
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: '#6b7280',
          }}
        >
          <div>
            © 2024 Smart Farming and Precision Agriculture Management System. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#privacy" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
              Privacy Policy
            </a>
            <a href="#terms" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
              Terms of Service
            </a>
            <a href="#support" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
              Support
            </a>
          </div>
        </footer>

      </main>


      {/* Operator Switch Authentication Modal */}
      {showRoleAuthModal && (
        <div className="role-modal-backdrop" onClick={cancelRoleSwitch}>
          <div className="role-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="role-modal-header">
              <div className="role-modal-header-text">
                <div className="role-modal-icon">🔐</div>
                <div>
                  <h3>Operator Authentication Required</h3>
                  <p>Confirm identity to switch to <strong>{targetRole}</strong></p>
                </div>
              </div>
              <button
                type="button"
                className="role-modal-close-btn"
                onClick={cancelRoleSwitch}
                title="Cancel"
              >
                ×
              </button>
            </div>

            <form onSubmit={confirmRoleSwitch}>
              <div className="role-modal-body">
                <div className="role-target-banner">
                  <span>Target Operator Context:</span>
                  <span className="role-target-pill">{targetRole}</span>
                </div>

                <div className="role-input-group">
                  <label>Operator ID or Username</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Enter operator username (e.g. farmer or vishwa)"
                    required
                    autoFocus
                  />
                </div>

                <div className="role-input-group">
                  <label>Operator Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title={showAuthPassword ? 'Hide' : 'Show'}
                    >
                      {showAuthPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Pre-fill helper */}
                <div className="role-demo-hint-box">
                  <span>💡 Quick Test Creds:</span>
                  <button
                    type="button"
                    className="role-demo-hint-btn"
                    onClick={() => {
                      if (targetRole === 'Admin') { setAuthUsername('vishwa'); setAuthPassword('Vishwa@123'); }
                      else if (targetRole === 'Farmer') { setAuthUsername('farmer'); setAuthPassword('Farmer@123'); }
                      else if (targetRole === 'Field Officer') { setAuthUsername('field_officer'); setAuthPassword('Officer@123'); }
                      else if (targetRole === 'Agricultural Officer') { setAuthUsername('agri_officer'); setAuthPassword('Officer@123'); }
                      else if (targetRole === 'Guest') { setAuthUsername('guest'); setAuthPassword('Guest@123'); }
                    }}
                  >
                    Auto-Fill {targetRole} Creds
                  </button>
                </div>

                {authError && (
                  <div className="role-modal-error-box">
                    ⚠️ {authError}
                  </div>
                )}
              </div>

              <div className="role-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={cancelRoleSwitch}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-confirm"
                  disabled={authLoading}
                >
                  {authLoading ? 'Verifying...' : 'Authenticate & Switch →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operator Toast Notification */}
      {toastMessage && (
        <div className="role-toast">
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default Layout