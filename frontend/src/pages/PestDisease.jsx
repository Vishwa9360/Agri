import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './PestDisease.css'

function PestDisease() {
  const [alerts, setAlerts] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Form Fields
  const [cropName, setCropName] = useState('')
  const [pestName, setPestName] = useState('')
  const [severity, setSeverity] = useState('High')
  const [affectedArea, setAffectedArea] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [detectionDate, setDetectionDate] = useState('')
  const [status, setStatus] = useState('Active')

  const [editId, setEditId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  // SRS Section 7 / Step 3-G AI Diagnostic Scanner State
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiCrop, setAiCrop] = useState('Wheat')
  const [aiSymptoms, setAiSymptoms] = useState('Yellow-orange pustules observed on leaf surfaces')
  const [aiImagePreview, setAiImagePreview] = useState(null)
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleAiScan = async (e) => {
    e.preventDefault()
    setAiLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/api/pest/diagnose', {
        farmId: 1,
        cropName: aiCrop,
        symptoms: aiSymptoms,
        imageMeta: aiImagePreview ? 'uploaded-leaf-scan.jpg' : '',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAiDiagnosisResult(res.data)
      loadAlerts()
    } catch (err) {
      console.error('Diagnosis error:', err)
      setError('Diagnosis service failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  // =========================
  // LOAD PEST ALERTS
  // =========================
  const loadAlerts = async () => {
    try {
      setLoadingList(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/pest/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('PEST ALERTS:', response.data)
      setAlerts(response.data)
    } catch (err) {
      console.error('GET PEST ALERTS ERROR:', err)
      if (err.response) {
        setError(`Failed to load pest alerts (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  // =========================
  // ADD PEST ALERT
  // =========================
  const handleAddAlert = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/pest/create',
        {
          cropName: cropName,
          pestName: pestName,
          severity: severity,
          affectedArea: affectedArea,
          symptoms: symptoms,
          recommendation: recommendation,
          detectionDate: detectionDate,
          status: status,
          farmId: 1,
          confidenceScore: 0.88,
          diagnosisSource: 'MANUAL_REPORT',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('ALERT CREATED:', response.data)
      alert('Pest & disease report logged successfully!')

      closeAddModal()
      loadAlerts()
    } catch (err) {
      console.error('ADD PEST ALERT ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to save pest alert.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // VIEW DETAILS (GET BY ID)
  // =========================
  const handleView = async (id) => {
    try {
      setViewLoading(true)
      setError('')
      setShowViewModal(true)

      const token = localStorage.getItem('token')

      const response = await api.get(`/pest/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW PEST DATA:', response.data)
      setSelectedItem(response.data)
    } catch (err) {
      console.error('VIEW PEST ALERT ERROR:', err)
      if (err.response) {
        setError(`Failed to load details: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setViewLoading(false)
    }
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEdit = (item) => {
    setEditId(item.id)
    setCropName(item.cropName || '')
    setPestName(item.pestName || '')
    setSeverity(item.severity || 'High')
    setAffectedArea(item.affectedArea || '')
    setSymptoms(item.symptoms || '')
    setRecommendation(item.recommendation || '')
    setDetectionDate(item.detectionDate || '')
    setStatus(item.status || 'Active')
    setError('')
    setShowEditModal(true)
  }

  // =========================
  // UPDATE PEST ALERT
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/pest/update/${editId}`,
        {
          cropName: cropName,
          pestName: pestName,
          severity: severity,
          affectedArea: affectedArea,
          symptoms: symptoms,
          recommendation: recommendation,
          detectionDate: detectionDate,
          status: status,
          farmId: 1,
          confidenceScore: 0.88,
          diagnosisSource: 'MANUAL_REPORT',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('ALERT UPDATED:', response.data)
      alert('Pest report updated successfully!')

      closeEditModal()
      loadAlerts()
    } catch (err) {
      console.error('UPDATE PEST ALERT ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update pest alert.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE PEST ALERT
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this pest report?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/pest/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Pest report removed successfully!')
      loadAlerts()
    } catch (err) {
      console.error('DELETE PEST ALERT ERROR:', err)
      if (err.response) {
        setError(`Failed to delete: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    }
  }

  // Close modals
  const closeAddModal = () => {
    setShowAddModal(false)
    setCropName('')
    setPestName('')
    setSeverity('High')
    setAffectedArea('')
    setSymptoms('')
    setRecommendation('')
    setDetectionDate('')
    setStatus('Active')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditId(null)
    setCropName('')
    setPestName('')
    setSeverity('High')
    setAffectedArea('')
    setSymptoms('')
    setRecommendation('')
    setDetectionDate('')
    setStatus('Active')
    setError('')
  }

  const closeView = () => {
    setShowViewModal(false)
    setSelectedItem(null)
    setError('')
  }

  // Search filter
  const filteredAlerts = alerts.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      (item.cropName && item.cropName.toLowerCase().includes(term)) ||
      (item.pestName && item.pestName.toLowerCase().includes(term)) ||
      (item.affectedArea && item.affectedArea.toLowerCase().includes(term)) ||
      (item.severity && item.severity.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    )
  })

  // Calculations
  const activeAlerts = alerts.filter((item) => item.status?.toLowerCase() === 'active').length
  const criticalCount = alerts.filter(
    (item) =>
      item.severity?.toLowerCase() === 'critical' || item.severity?.toLowerCase() === 'high'
  ).length
  const resolvedCount = alerts.filter((item) => item.status?.toLowerCase() === 'resolved').length

  return (
    <Layout>
      <div className="pest-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="pest-header">
          <div>
            <h1>Pest & Disease Intelligence</h1>
            <p>Early pathogen detection, infestation tracking, and treatment advisories.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="add-pest-btn"
              style={{ background: '#7c3aed' }}
              onClick={() => {
                setError('')
                setShowAiModal(true)
              }}
            >
              <span>🔬</span> AI Foliar Diagnostic Scanner
            </button>
            <button
              className="add-pest-btn"
              onClick={() => {
                setError('')
                setShowAddModal(true)
              }}
            >
              <span>+</span> Report Infestation
            </button>
          </div>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <div className="pest-summary">
          <div className="pest-summary-card">
            <span>Total Reports</span>
            <h2>{alerts.length}</h2>
            <p>Historical & active alerts</p>
          </div>

          <div className="pest-summary-card">
            <span>Active Outbreaks</span>
            <h2 style={{ color: activeAlerts > 0 ? '#dc2626' : '#20372a' }}>
              {activeAlerts}
            </h2>
            <p>Requiring field action</p>
          </div>

          <div className="pest-summary-card">
            <span>High / Critical Severity</span>
            <h2 style={{ color: criticalCount > 0 ? '#b91c1c' : '#20372a' }}>
              {criticalCount}
            </h2>
            <p>Priority treatment zones</p>
          </div>

          <div className="pest-summary-card">
            <span>Resolved</span>
            <h2>{resolvedCount}</h2>
            <p>Treated & neutralized</p>
          </div>
        </div>

        {/* =========================
            LIST PANEL
        ========================= */}
        <div className="pest-panel">
          <div className="pest-panel-header">
            <div>
              <h2>Outbreak Surveillance Feed</h2>
              <p>Active pathogens, affected farm blocks, and agronomic countermeasures.</p>
            </div>

            <div className="pest-search">
              🔍
              <input
                type="text"
                placeholder="Search crop, pest, field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="pest-table">
            <div className="pest-table-header">
              <span>Target Crop</span>
              <span>Pest / Disease</span>
              <span>Severity</span>
              <span>Affected Area</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loadingList && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Scanning field pathology logs...
              </div>
            )}

            {!loadingList && error && !showAddModal && !showEditModal && !showViewModal && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {!loadingList && !error && filteredAlerts.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {alerts.length === 0
                  ? 'No pest or disease outbreaks detected! Click "+ Report Infestation" to log an incident.'
                  : 'No pest records matched your search.'}
              </div>
            )}

            {!loadingList &&
              filteredAlerts.map((item) => (
                <div className="pest-table-row" key={item.id}>
                  <div>
                    <strong>{item.cropName}</strong>
                    <small>Incident #{String(item.id).padStart(3, '0')}</small>
                  </div>

                  <span>
                    <strong style={{ color: '#b91c1c' }}>{item.pestName}</strong>
                  </span>

                  <span>
                    <span
                      className={`severity-badge ${
                        item.severity?.toLowerCase() === 'critical'
                          ? 'critical'
                          : item.severity?.toLowerCase() === 'high'
                          ? 'high'
                          : item.severity?.toLowerCase() === 'moderate'
                          ? 'moderate'
                          : 'low'
                      }`}
                    >
                      {item.severity || 'Moderate'}
                    </span>
                  </span>

                  <span>{item.affectedArea || 'Whole Farm'}</span>

                  <span>
                    <span
                      className={`pest-status-badge ${
                        item.status?.toLowerCase() === 'resolved'
                          ? 'resolved'
                          : item.status?.toLowerCase() === 'under treatment'
                          ? 'treating'
                          : 'active'
                      }`}
                    >
                      {item.status || 'Active'}
                    </span>
                  </span>

                  <div className="pest-actions">
                    <button
                      title="View Countermeasures"
                      onClick={() => handleView(item.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Report"
                      onClick={() => openEdit(item)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Report"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* =========================
            ADD MODAL
        ========================= */}
        {showAddModal && (
          <div className="crop-modal-overlay" onClick={closeAddModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Report Pest / Disease Infestation</h2>
                  <p>Log a crop pathogen outbreak and recommend remediation.</p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                  }}
                  onClick={closeAddModal}
                >
                  ✕
                </button>
              </div>

              {error && (
                <p style={{ color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                  {error}
                </p>
              )}

              <form onSubmit={handleAddAlert}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Crop Affected</label>
                    <input
                      type="text"
                      placeholder="e.g. Wheat, Basmati Rice, Tomato"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Pest / Disease Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aphids, Fall Armyworm, Leaf Blight"
                      value={pestName}
                      onChange={(e) => setPestName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Severity Level</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="Critical">Critical (Immediate Hazard)</option>
                      <option value="High">High (Rapid Spread)</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low (Early Detection)</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Affected Field / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. South Field - Block A"
                      value={affectedArea}
                      onChange={(e) => setAffectedArea(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Visible Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g. Yellow lesions on leaves, curled stems"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Treatment / Remediation Advisory</label>
                  <input
                    type="text"
                    placeholder="e.g. Spray Neem oil (5ml/L) or Chlorantraniliprole 18.5% SC"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Detection Date</label>
                    <input
                      type="date"
                      value={detectionDate}
                      onChange={(e) => setDetectionDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active Outbreak</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="crop-form-actions">
                  <button
                    type="button"
                    className="cancel-crop-btn"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-crop-btn"
                    style={{ background: '#dc2626' }}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Log Infestation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            EDIT MODAL
        ========================= */}
        {showEditModal && (
          <div className="crop-modal-overlay" onClick={closeEditModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Update Outbreak Log</h2>
                  <p>Update treatment progression and status.</p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                  }}
                  onClick={closeEditModal}
                >
                  ✕
                </button>
              </div>

              {error && (
                <p style={{ color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                  {error}
                </p>
              )}

              <form onSubmit={handleUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Crop Affected</label>
                    <input
                      type="text"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Pest / Disease Name</label>
                    <input
                      type="text"
                      value={pestName}
                      onChange={(e) => setPestName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Severity Level</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Affected Field / Block</label>
                    <input
                      type="text"
                      value={affectedArea}
                      onChange={(e) => setAffectedArea(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Visible Symptoms</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Treatment Advisory</label>
                  <input
                    type="text"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Detection Date</label>
                    <input
                      type="date"
                      value={detectionDate}
                      onChange={(e) => setDetectionDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active Outbreak</option>
                      <option value="Under Treatment">Under Treatment</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="crop-form-actions">
                  <button
                    type="button"
                    className="cancel-crop-btn"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-crop-btn"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            VIEW MODAL
        ========================= */}
        {showViewModal && (
          <div className="crop-modal-overlay" onClick={closeView}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Outbreak Countermeasure Advisory</h2>
                  <p>Agronomic incident report #{selectedItem?.id}</p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: '#f3f4f6',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                  }}
                  onClick={closeView}
                >
                  ✕
                </button>
              </div>

              {viewLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                  Loading outbreak dossier...
                </div>
              ) : selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Crop Affected
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.cropName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Pathogen / Pest
                      </span>
                      <p style={{ fontSize: '15px', color: '#dc2626', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.pestName}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Severity
                      </span>
                      <div style={{ marginTop: '5px' }}>
                        <span
                          className={`severity-badge ${
                            selectedItem.severity?.toLowerCase() === 'critical'
                              ? 'critical'
                              : selectedItem.severity?.toLowerCase() === 'high'
                              ? 'high'
                              : selectedItem.severity?.toLowerCase() === 'moderate'
                              ? 'moderate'
                              : 'low'
                          }`}
                        >
                          {selectedItem.severity}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Affected Field
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.affectedArea}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                    <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                      Observed Symptoms
                    </span>
                    <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0 0', lineHeight: '1.4' }}>
                      {selectedItem.symptoms}
                    </p>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                      🛡️ Agronomic Recommendation
                    </span>
                    <p style={{ fontSize: '14px', color: '#14532d', fontWeight: '600', margin: '5px 0 0', lineHeight: '1.4' }}>
                      {selectedItem.recommendation}
                    </p>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Detected On
                      </span>
                      <p style={{ fontSize: '14px', color: '#20372a', fontWeight: '600', margin: '3px 0 0' }}>
                        {selectedItem.detectionDate}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        Status
                      </span>
                      <span
                        className={`pest-status-badge ${
                          selectedItem.status?.toLowerCase() === 'resolved'
                            ? 'resolved'
                            : selectedItem.status?.toLowerCase() === 'under treatment'
                            ? 'treating'
                            : 'active'
                        }`}
                      >
                        {selectedItem.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="crop-form-actions" style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      className="save-crop-btn"
                      onClick={closeView}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* =========================
            AI FOLIAR DIAGNOSTIC SCANNER MODAL (SRS Section 7 & Step 3-G)
        ========================= */}
        {showAiModal && (
          <div className="crop-modal-overlay" onClick={() => setShowAiModal(false)}>
            <div className="crop-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header" style={{ background: '#7c3aed', color: '#fff', borderRadius: '12px 12px 0 0', margin: '-24px -24px 20px -24px', padding: '20px 24px' }}>
                <div>
                  <h2 style={{ color: '#fff', margin: 0 }}>🔬 AI Foliar Diagnostic Scanner</h2>
                  <p style={{ color: '#ede9fe', margin: '4px 0 0', fontSize: '13px' }}>
                    Computer vision heuristic advisory for foliar pathogens & pest symptoms (SRS Section 7)
                  </p>
                </div>
                <button
                  type="button"
                  className="close-modal-btn"
                  style={{ color: '#fff' }}
                  onClick={() => setShowAiModal(false)}
                >
                  ✕
                </button>
              </div>

              {!aiDiagnosisResult ? (
                <form onSubmit={handleAiScan}>
                  <div className="crop-form-group">
                    <label>Crop Variety</label>
                    <select
                      value={aiCrop}
                      onChange={(e) => setAiCrop(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Wheat">Wheat (HD-2967)</option>
                      <option value="Soybean">Soybean (JS-335)</option>
                      <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                      <option value="Basmati Rice">Basmati Rice (Oryza sativa)</option>
                      <option value="Cotton">Cotton (Gossypium)</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Observed Foliar Symptoms</label>
                    <textarea
                      rows={3}
                      value={aiSymptoms}
                      onChange={(e) => setAiSymptoms(e.target.value)}
                      placeholder="Describe leaf spots, pustules, discoloration, or wilt..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Upload Foliar Leaf Scan / Camera Image</label>
                    <div
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        cursor: 'pointer'
                      }}
                      onClick={() => setAiImagePreview('leaf_scan_macro_sample.jpg')}
                    >
                      <span style={{ fontSize: '28px' }}>📷</span>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569' }}>
                        {aiImagePreview ? '✓ Leaf sample attached: leaf_scan_macro_sample.jpg' : 'Click to attach foliar photograph or scan'}
                      </p>
                      <small style={{ color: '#94a3b8' }}>Supports JPEG, PNG (Max 5MB)</small>
                    </div>
                  </div>

                  <div className="crop-form-actions" style={{ marginTop: '20px' }}>
                    <button
                      type="button"
                      className="cancel-crop-btn"
                      onClick={() => setShowAiModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="save-crop-btn"
                      style={{ background: '#7c3aed' }}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Analyzing Pathogen...' : '🔬 Run AI Diagnostic Analysis'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '16px', color: '#581c87' }}>{aiDiagnosisResult.detectedPest}</strong>
                      <span style={{ background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        Confidence: {aiDiagnosisResult.confidenceScore}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b21a8' }}>
                      {aiDiagnosisResult.symptomsSummary}
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px', color: '#15803d' }}>🌿 Recommended Organic Bio-Remedy:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#14532d', background: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
                      {aiDiagnosisResult.organicRemedy}
                    </p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontSize: '13px', color: '#b91c1c' }}>🧪 Recommended Chemical Control:</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#7f1d1d', background: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
                      {aiDiagnosisResult.chemicalRemedy}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="save-crop-btn"
                    style={{ width: '100%', background: '#7c3aed' }}
                    onClick={() => {
                      setAiDiagnosisResult(null)
                      setShowAiModal(false)
                    }}
                  >
                    ✓ Acknowledge & Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default PestDisease
