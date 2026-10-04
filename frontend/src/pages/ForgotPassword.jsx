import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // Step 1: Request OTP, Step 2: Submit OTP & New Password
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtpNotice, setDevOtpNotice] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!identifier.trim()) {
      setError('Please enter your registered email or username')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/auth/forgot-password', { identifier: identifier.trim() })
      if (res.data && res.data.devOtpStub) {
        setDevOtpNotice(`[EVALUATION STUB] OTP code generated: ${res.data.devOtpStub} (Valid for 10 minutes)`)
      }
      setStep(2)
    } catch (err) {
      console.error('OTP request error:', err)
      setError(err.response?.data || 'Failed to request OTP. Please verify your identifier.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$/
    if (!passwordPattern.test(newPassword)) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, digit, and special symbol.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/auth/reset-password', {
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
      })
      setSuccessMessage(res.data?.message || 'Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.response?.data || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
      <div className="register-card" style={{ maxWidth: '480px', width: '100%', background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>🔑</span>
          <h2 style={{ fontSize: '22px', color: '#0f172a', marginTop: '8px' }}>Password Recovery</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {step === 1 ? 'Enter your registered email or username to receive a verification OTP' : 'Enter the OTP and your new secure password'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {devOtpNotice && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {devOtpNotice}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {successMessage} Redirecting to login...
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Email or Username
              </label>
              <input
                type="text"
                placeholder="e.g. farmer@farming.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              {loading ? 'Requesting OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                6-Digit OTP Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 8 chars, uppercase, digit, symbol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              {loading ? 'Resetting Password...' : 'Confirm & Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
            >
              Change Email / Request New OTP
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ fontSize: '13px', color: '#16a34a', textDecoration: 'none', fontWeight: '500' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
