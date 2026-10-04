import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  // Form Steps: 1 = Personal Details, 2 = Role & Assignment, 3 = Password & Security
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'FARMER',
    assignment: 'Nashik District Agricultural Cluster',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (/[A-Z]/.test(pass)) strength += 25
    if (/[a-z]/.test(pass)) strength += 25
    if (/[0-9]/.test(pass) && /[@#$%^&+=!._-]/.test(pass)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  // Step 1 Validation
  const validateStep1 = () => {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Name is required'
    } else if (!/^[a-zA-Z\s]{2,100}$/.test(formData.name.trim())) {
      errs.name = 'Name must not contain numbers or special characters'
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter a valid email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address'
    }

    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone Number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      errs.phoneNumber = 'Phone Number must be exactly 10 digits long'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Step 2 Validation
  const validateStep2 = () => {
    const errs = {}
    if (!formData.role) {
      errs.role = 'Please select your role'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Step 3 Validation
  const validateStep3 = () => {
    const errs = {}
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$/

    if (!formData.password) {
      errs.password = 'Password must meet security requirements'
    } else if (!passwordPattern.test(formData.password)) {
      errs.password =
        'Password must meet security requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character)'
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep3()) return

    setLoading(true)
    setApiError('')

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber.trim(),
      username: formData.username.trim() || formData.email.trim().toLowerCase(),
      role: formData.role.toUpperCase(),
      password: formData.password,
    }

    try {
      await api.post('/api/auth/register', payload)
      setSuccessMessage('Registration successful! Please verify your email.')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      console.error('Registration error:', err)
      if (err.response && err.response.data) {
        setApiError(
          typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data.message || 'Registration failed'
        )
      } else {
        setApiError('Unable to connect to server. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '520px',
          padding: '36px',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '38px', marginBottom: '6px' }}>🌿</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#064e3b', margin: '0 0 4px 0' }}>
            AgroSense
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Smart Farming & Precision Agriculture Platform
          </p>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            position: 'relative',
          }}
        >
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Role & Scope' },
            { num: 3, label: 'Security' },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: currentStep >= s.num ? '#059669' : '#e5e7eb',
                  color: currentStep >= s.num ? '#ffffff' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}
              >
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
          ))}
          {/* Progress Bar line behind circles */}
          <div
            style={{
              position: 'absolute',
              top: '17px',
              left: '30px',
              right: '30px',
              height: '3px',
              background: '#e5e7eb',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: `${((currentStep - 1) / 2) * 100}%`,
                height: '100%',
                background: '#059669',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMessage && (
          <div
            style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {apiError && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
              textAlign: 'center',
            }}
          >
            ⚠ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ========================================================
              STEP 1: PERSONAL INFORMATION
              ======================================================== */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                  }}
                >
                  Full Name (Alphabetic Only) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.name ? '1.5px solid #ef4444' : '1px solid #d1d5db',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@farm.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.email ? '1.5px solid #ef4444' : '1px solid #d1d5db',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.email && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                  }}
                >
                  Phone Number (Exactly 10 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 9822334455"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.phoneNumber ? '1.5px solid #ef4444' : '1px solid #d1d5db',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.phoneNumber && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Continue to Role & Scope →
              </button>
            </div>
          )}

          {/* ========================================================
              STEP 2: ROLE & ASSIGNMENT
              ======================================================== */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Select Platform Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="FARMER">👨‍🌾 Farmer (Farm Owner / Producer)</option>
                  <option value="FIELD_OFFICER">📋 Field Officer (Regional Inspector)</option>
                  <option value="AGRICULTURAL_OFFICER">🔬 Agricultural Officer (Agronomist)</option>
                  <option value="EXTENSION_OFFICER">🌾 Extension Officer (Advisory)</option>
                  <option value="GUEST">👤 Guest (Read-Only Public Access)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Smart Farming Cluster Assignment
                </label>
                <input
                  type="text"
                  value={formData.assignment}
                  onChange={(e) => setFormData({ ...formData, assignment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Preferred Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to use email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Continue to Security →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: PASSWORD & SECURITY
              ======================================================== */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                  }}
                >
                  Password (Min 8 chars, 1 Upper, 1 Lower, 1 Digit, 1 Special) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 42px 10px 14px',
                      borderRadius: '8px',
                      border: errors.password ? '1.5px solid #ef4444' : '1px solid #d1d5db',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
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
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Real-time Password Strength Indicator per SRS Section 9 */}
                <div style={{ marginTop: '8px' }}>
                  <div
                    style={{
                      height: '4px',
                      borderRadius: '2px',
                      background: '#e5e7eb',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${passwordStrength}%`,
                        height: '100%',
                        background:
                          passwordStrength <= 25
                            ? '#ef4444'
                            : passwordStrength <= 50
                            ? '#f59e0b'
                            : passwordStrength <= 75
                            ? '#3b82f6'
                            : '#10b981',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px', display: 'block' }}>
                    Password Strength:{' '}
                    <strong>
                      {passwordStrength <= 25
                        ? 'Weak'
                        : passwordStrength <= 50
                        ? 'Fair'
                        : passwordStrength <= 75
                        ? 'Good'
                        : 'Excellent (Compliant)'}
                    </strong>
                  </span>
                </div>

                {errors.password && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errors.password}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                  }}
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.confirmPassword ? '1.5px solid #ef4444' : '1px solid #d1d5db',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Registering Account...' : 'Complete Registration ✓'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Already have an active account?{' '}
            <Link to="/login" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
