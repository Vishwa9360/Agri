import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './DroneMonitoring.css'

function DroneMonitoring() {
  const [missions, setMissions] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Form Fields
  const [droneId, setDroneId] = useState('AgroDrone-X4')
  const [fieldName, setFieldName] = useState('')
  const [missionType, setMissionType] = useState('Multispectral NDVI Scan')
  const [coverageArea, setCoverageArea] = useState('')
  const [healthIndex, setHealthIndex] = useState('88')
  const [flightDate, setFlightDate] = useState('')
  const [status, setStatus] = useState('Scheduled')

  const [editId, setEditId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // =========================
  // LOAD DRONE MISSIONS
  // =========================
  const loadMissions = async () => {
    try {
      setLoadingList(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/drone/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('DRONE MISSIONS:', response.data)
      setMissions(response.data)
    } catch (err) {
      console.error('GET DRONE MISSIONS ERROR:', err)
      if (err.response) {
        setError(`Failed to load drone missions (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadMissions()
  }, [])


  const handleAddMission = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/drone/create',
        {
          droneId: droneId || 'AgroDrone-X4',
          fieldName: fieldName,
          missionType: missionType || 'Multispectral NDVI Scan',
          coverageArea: parseFloat(coverageArea) || 5.0,
          healthIndex: parseFloat(healthIndex) || 85.0,
          flightDate: flightDate || new Date().toISOString().split('T')[0],
          status: status || 'Scheduled',
          farmId: 1,
          altitudeMeters: 45.0,
          batteryLevelPercent: 82.0,
          ndviMean: 0.72,
          canopyHealthStatus: 'GOOD',
          waypointsCount: 12,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('MISSION CREATED:', response.data)
      alert('Drone mission scheduled successfully!')

      closeAddModal()
      loadMissions()
    } catch (err) {
      console.error('ADD DRONE MISSION ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to schedule drone mission.')
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

      const response = await api.get(`/drone/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW DRONE DATA:', response.data)
      setSelectedItem(response.data)
    } catch (err) {
      console.error('VIEW DRONE MISSION ERROR:', err)
      if (err.response) {
        setError(`Failed to load details: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setViewLoading(false)
    }
  }

  const openEdit = (item) => {
    setEditId(item.id)
    setDroneId(item.droneId || 'AgroDrone-X4')
    setFieldName(item.fieldName || '')
    setMissionType(item.missionType || 'Multispectral NDVI Scan')
    setCoverageArea(item.coverageArea !== undefined ? String(item.coverageArea) : '')
    setHealthIndex(item.healthIndex !== undefined ? String(item.healthIndex) : '85')
    setFlightDate(item.flightDate || '')
    setStatus(item.status || 'Scheduled')
    setError('')
    setShowEditModal(true)
  }

  // =========================
  // UPDATE MISSION
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/drone/update/${editId}`,
        {
          droneId: droneId || 'AgroDrone-X4',
          fieldName: fieldName,
          missionType: missionType || 'Multispectral NDVI Scan',
          coverageArea: parseFloat(coverageArea) || 5.0,
          healthIndex: parseFloat(healthIndex) || 85.0,
          flightDate: flightDate || new Date().toISOString().split('T')[0],
          status: status || 'Scheduled',
          farmId: 1,
          altitudeMeters: 45.0,
          batteryLevelPercent: 82.0,
          ndviMean: 0.72,
          canopyHealthStatus: 'GOOD',
          waypointsCount: 12,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('MISSION UPDATED:', response.data)
      alert('Drone mission updated successfully!')

      closeEditModal()
      loadMissions()
    } catch (err) {
      console.error('UPDATE DRONE MISSION ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update drone mission.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE MISSION
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this drone flight mission?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/drone/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Drone mission deleted successfully!')
      loadMissions()
    } catch (err) {
      console.error('DELETE DRONE MISSION ERROR:', err)
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
    setDroneId('AgroDrone-X4')
    setFieldName('')
    setMissionType('Multispectral NDVI Scan')
    setCoverageArea('')
    setHealthIndex('88')
    setFlightDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditId(null)
    setDroneId('AgroDrone-X4')
    setFieldName('')
    setMissionType('Multispectral NDVI Scan')
    setCoverageArea('')
    setHealthIndex('88')
    setFlightDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeView = () => {
    setShowViewModal(false)
    setSelectedItem(null)
    setError('')
  }

  // Search filter
  const filteredMissions = missions.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      (item.droneId && item.droneId.toLowerCase().includes(term)) ||
      (item.fieldName && item.fieldName.toLowerCase().includes(term)) ||
      (item.missionType && item.missionType.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    )
  })

  // Calculations
  const totalArea = missions.reduce((sum, item) => sum + (item.coverageArea || 0), 0)
  const avgHealth =
    missions.length > 0
      ? (missions.reduce((sum, item) => sum + (item.healthIndex || 0), 0) / missions.length).toFixed(1)
      : '0'
  const activeFlights = missions.filter(
    (item) => item.status?.toLowerCase() === 'in flight' || item.status?.toLowerCase() === 'scheduled'
  ).length

  return (
    <Layout>
      <div className="drone-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="drone-header">
          <div>
            <h1>Drone Aerial Surveillance</h1>
            <p>Multispectral NDVI field scouting, canopy imagery, and automated aerial flight logs.</p>
          </div>

          <button
            className="add-drone-btn"
            onClick={() => {
              setError('')
              setShowAddModal(true)
            }}
          >
            <span>+</span> Schedule Flight Mission
          </button>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <div className="drone-summary">
          <div className="drone-summary-card">
            <span>Total Flight Missions</span>
            <h2>{missions.length}</h2>
            <p>Completed & scheduled flights</p>
          </div>

          <div className="drone-summary-card">
            <span>Surveyed Area</span>
            <h2>{totalArea.toFixed(1)} ha</h2>
            <p>Cumulative canopy mapping</p>
          </div>

          <div className="drone-summary-card">
            <span>Avg NDVI Health Score</span>
            <h2 style={{ color: '#2f8f46' }}>{avgHealth}%</h2>
            <p>Canopy vigor rating</p>
          </div>

          <div className="drone-summary-card">
            <span>Active / Upcoming</span>
            <h2 style={{ color: '#0284c7' }}>{activeFlights}</h2>
            <p>Missions in flight or planned</p>
          </div>
        </div>

        {/* =========================
            MISSION LIST PANEL
        ========================= */}
        <div className="drone-panel">
          <div className="drone-panel-header">
            <div>
              <h2>UAV Flight Mission Log</h2>
              <p>Aerial surveys, sensor payloads, and crop health metrics.</p>
            </div>

            <div className="drone-search">
              🔍
              <input
                type="text"
                placeholder="Search drone, field, mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="drone-table">
            <div className="drone-table-header">
              <span>Drone Payload</span>
              <span>Target Field</span>
              <span>Mission Type</span>
              <span>Area (ha)</span>
              <span>NDVI Health</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loadingList && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Connecting to UAV telemetry stations...
              </div>
            )}

            {!loadingList && error && !showAddModal && !showEditModal && !showViewModal && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {!loadingList && !error && filteredMissions.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {missions.length === 0
                  ? 'No drone flight missions logged yet. Click "+ Schedule Flight Mission" to dispatch an aerial scan!'
                  : 'No missions matched your search.'}
              </div>
            )}

            {!loadingList &&
              filteredMissions.map((item) => (
                <div className="drone-table-row" key={item.id}>
                  <div>
                    <strong>{item.droneId}</strong>
                    <small>Flight #{String(item.id).padStart(3, '0')}</small>
                  </div>

                  <span>{item.fieldName || 'East Block'}</span>

                  <span>
                    <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>
                      {item.missionType}
                    </span>
                  </span>

                  <span>{item.coverageArea} ha</span>

                  <span>
                    <strong style={{ color: '#2f8f46' }}>{item.healthIndex}%</strong>
                  </span>

                  <span>
                    <span
                      className={`drone-status-badge ${
                        item.status?.toLowerCase() === 'completed'
                          ? 'completed'
                          : item.status?.toLowerCase() === 'in flight'
                          ? 'in-flight'
                          : 'scheduled'
                      }`}
                    >
                      {item.status || 'Scheduled'}
                    </span>
                  </span>

                  <div className="drone-actions">
                    <button
                      title="View Flight Dossier"
                      onClick={() => handleView(item.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Flight"
                      onClick={() => openEdit(item)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Flight"
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
                  <h2>Schedule Drone Mission</h2>
                  <p>Dispatch an autonomous aerial drone survey.</p>
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

              <form onSubmit={handleAddMission}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Drone Model / Identifier</label>
                    <select
                      value={droneId}
                      onChange={(e) => setDroneId(e.target.value)}
                    >
                      <option value="AgroDrone-X4">AgroDrone-X4 (Multispectral)</option>
                      <option value="DJI-Agras-T40">DJI-Agras-T40 (High Payload)</option>
                      <option value="SkyScout-01">SkyScout-01 (Thermal Scanner)</option>
                      <option value="Falcon-Surveyor">Falcon-Surveyor (LiDAR / RGB)</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Target Field</label>
                    <input
                      type="text"
                      placeholder="e.g. North Field - Wheat"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Mission Type</label>
                  <select
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value)}
                  >
                    <option value="Multispectral NDVI Scan">Multispectral NDVI Scan (Vigor Assessment)</option>
                    <option value="Thermal Crop Stress">Thermal Crop Stress & Moisture Mapping</option>
                    <option value="Aerial RGB Mapping">High-Res Aerial RGB Mapping & 3D Model</option>
                    <option value="Precision Spraying">Precision Targeted Biological Spraying</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Coverage Area (ha)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 12.5"
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>NDVI Health Score (%)</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 88"
                      value={healthIndex}
                      onChange={(e) => setHealthIndex(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Flight Date</label>
                    <input
                      type="date"
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Mission Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Flight">In Flight</option>
                      <option value="Completed">Completed</option>
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
                    style={{ background: '#0284c7' }}
                    disabled={loading}
                  >
                    {loading ? 'Dispatching...' : 'Dispatch Mission'}
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
                  <h2>Update Flight Mission</h2>
                  <p>Update telemetry, coverage, and mission status.</p>
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
                    <label>Drone Model / Identifier</label>
                    <select
                      value={droneId}
                      onChange={(e) => setDroneId(e.target.value)}
                    >
                      <option value="AgroDrone-X4">AgroDrone-X4 (Multispectral)</option>
                      <option value="DJI-Agras-T40">DJI-Agras-T40 (High Payload)</option>
                      <option value="SkyScout-01">SkyScout-01 (Thermal Scanner)</option>
                      <option value="Falcon-Surveyor">Falcon-Surveyor (LiDAR / RGB)</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Target Field</label>
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Mission Type</label>
                  <select
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value)}
                  >
                    <option value="Multispectral NDVI Scan">Multispectral NDVI Scan (Vigor Assessment)</option>
                    <option value="Thermal Crop Stress">Thermal Crop Stress & Moisture Mapping</option>
                    <option value="Aerial RGB Mapping">High-Res Aerial RGB Mapping & 3D Model</option>
                    <option value="Precision Spraying">Precision Targeted Biological Spraying</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Coverage Area (ha)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>NDVI Health Score (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={healthIndex}
                      onChange={(e) => setHealthIndex(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Flight Date</label>
                    <input
                      type="date"
                      value={flightDate}
                      onChange={(e) => setFlightDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Mission Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Flight">In Flight</option>
                      <option value="Completed">Completed</option>
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
                    style={{ background: '#0284c7' }}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Mission'}
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
                  <h2>Aerial Mission Dossier</h2>
                  <p>Telemetry and spectral analysis for flight #{selectedItem?.id}</p>
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
                  Downloading UAV telemetry...
                </div>
              ) : selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Drone Payload
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.droneId}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Target Field
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.fieldName}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                    <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                      Mission Profile
                    </span>
                    <p style={{ fontSize: '14px', color: '#0369a1', fontWeight: '700', margin: '4px 0 0' }}>
                      {selectedItem.missionType}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Coverage Area
                      </span>
                      <p style={{ fontSize: '16px', color: '#20372a', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.coverageArea} ha
                      </p>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600', textTransform: 'uppercase' }}>
                        Canopy Health (NDVI)
                      </span>
                      <p style={{ fontSize: '18px', color: '#15803d', fontWeight: '800', margin: '4px 0 0' }}>
                        {selectedItem.healthIndex}% (Optimal)
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Flight Date
                      </span>
                      <p style={{ fontSize: '14px', color: '#20372a', fontWeight: '600', margin: '3px 0 0' }}>
                        {selectedItem.flightDate}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        Mission Status
                      </span>
                      <span
                        className={`drone-status-badge ${
                          selectedItem.status?.toLowerCase() === 'completed'
                            ? 'completed'
                            : selectedItem.status?.toLowerCase() === 'in flight'
                            ? 'in-flight'
                            : 'scheduled'
                        }`}
                      >
                        {selectedItem.status || 'Scheduled'}
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

      </div>
    </Layout>
  )
}

export default DroneMonitoring
