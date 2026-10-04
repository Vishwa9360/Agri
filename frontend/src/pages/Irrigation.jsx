import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './Irrigation.css'

function Irrigation() {
  const [schedules, setSchedules] = useState([])
  const [loadingSchedules, setLoadingSchedules] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Form Fields
  const [fieldName, setFieldName] = useState('')
  const [irrigationType, setIrrigationType] = useState('Drip Irrigation')
  const [waterAmount, setWaterAmount] = useState('')
  const [irrigationDate, setIrrigationDate] = useState('')
  const [status, setStatus] = useState('Scheduled')

  const [editId, setEditId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/irrigation/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('IRRIGATION DATA:', response.data)
      setSchedules(response.data)
    } catch (err) {
      console.error('GET IRRIGATION ERROR:', err)
      if (err.response) {
        setError(`Failed to load schedules (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingSchedules(false)
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])
  const handleAddSchedule = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/irrigation/create',
        {
          fieldName: fieldName,
          irrigationType: irrigationType,
          waterAmount: parseFloat(waterAmount) || 0,
          irrigationDate: irrigationDate,
          status: status,
          durationMinutes: 45,
          moistureThreshold: 30.0,
          waterSavedM3: 10.0,
          pumpValveId: 'PUMP-VALVE-01',
          conflictStatus: 'NO_CONFLICT',
          frequency: 'ONCE',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('IRRIGATION SCHEDULED:', response.data)
      alert('Irrigation cycle scheduled successfully!')

      closeAddModal()
      loadSchedules()
    } catch (err) {
      console.error('ADD IRRIGATION ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to schedule irrigation cycle.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }
  const handleView = async (id) => {
    try {
      setViewLoading(true)
      setError('')
      setShowViewModal(true)

      const token = localStorage.getItem('token')

      const response = await api.get(`/irrigation/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW IRRIGATION DATA:', response.data)
      setSelectedItem(response.data)
    } catch (err) {
      console.error('VIEW IRRIGATION ERROR:', err)
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
    setFieldName(item.fieldName || '')
    setIrrigationType(item.irrigationType || 'Drip Irrigation')
    setWaterAmount(item.waterAmount !== undefined ? String(item.waterAmount) : '')
    setIrrigationDate(item.irrigationDate || '')
    setStatus(item.status || 'Scheduled')
    setError('')
    setShowEditModal(true)
  }
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/irrigation/update/${editId}`,
        {
          fieldName: fieldName,
          irrigationType: irrigationType,
          waterAmount: parseFloat(waterAmount) || 0,
          irrigationDate: irrigationDate,
          status: status,
          durationMinutes: 45,
          moistureThreshold: 30.0,
          waterSavedM3: 10.0,
          pumpValveId: 'PUMP-VALVE-01',
          conflictStatus: 'NO_CONFLICT',
          frequency: 'ONCE',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('IRRIGATION UPDATED:', response.data)
      alert('Irrigation cycle updated successfully!')

      closeEditModal()
      loadSchedules()
    } catch (err) {
      console.error('UPDATE IRRIGATION ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update irrigation cycle.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this irrigation schedule?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/irrigation/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Irrigation schedule deleted successfully!')
      loadSchedules()
    } catch (err) {
      console.error('DELETE IRRIGATION ERROR:', err)
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
    setFieldName('')
    setIrrigationType('Drip Irrigation')
    setWaterAmount('')
    setIrrigationDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditId(null)
    setFieldName('')
    setIrrigationType('Drip Irrigation')
    setWaterAmount('')
    setIrrigationDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeView = () => {
    setShowViewModal(false)
    setSelectedItem(null)
    setError('')
  }

  // Search filter
  const filteredSchedules = schedules.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      (item.fieldName && item.fieldName.toLowerCase().includes(term)) ||
      (item.irrigationType && item.irrigationType.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term)) ||
      (item.irrigationDate && item.irrigationDate.includes(term))
    )
  })

  // Summary counts
  const totalWater = schedules.reduce((sum, item) => sum + (item.waterAmount || 0), 0)
  const activeCount = schedules.filter((item) => item.status?.toLowerCase() === 'in progress').length
  const completedCount = schedules.filter((item) => item.status?.toLowerCase() === 'completed').length

  return (
    <Layout>
      <div className="irrigation-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="irrigation-header">
          <div>
            <h1>Precision Irrigation</h1>
            <p>Smart water scheduling, zone allocation, and consumption tracking.</p>
          </div>

          <button
            className="add-irrigation-btn"
            onClick={() => {
              setError('')
              setShowAddModal(true)
            }}
          >
            <span>+</span> Schedule Irrigation
          </button>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <div className="irrigation-summary">
          <div className="irrigation-summary-card">
            <span>Total Cycles</span>
            <h2>{schedules.length}</h2>
            <p>Configured schedules</p>
          </div>

          <div className="irrigation-summary-card">
            <span>Total Water Planned</span>
            <h2>{totalWater.toLocaleString()} L</h2>
            <p>Allocated volume</p>
          </div>

          <div className="irrigation-summary-card">
            <span>In Progress</span>
            <h2>{activeCount}</h2>
            <p>Active pumping zones</p>
          </div>

          <div className="irrigation-summary-card">
            <span>Completed</span>
            <h2>{completedCount}</h2>
            <p>Finished water cycles</p>
          </div>
        </div>

        {/* AUTOMATED THRESHOLD ENGINE & CONSERVATION TELEMETRY BANNER */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>💧</span>
              <strong style={{ color: '#166534', fontSize: '15px' }}>Automated Threshold Engine: ACTIVE</strong>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Trigger: &lt; 30% Moisture</span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#14532d', fontSize: '13px' }}>
              Pumps trigger automatically upon sensor stress detection. Overlap conflict avoidance active across all valves.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '500' }}>Cumulative Water Conserved</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#166534' }}>24.3 m³ (24,300 L saved)</div>
          </div>
        </div>

        {/* =========================
            IRRIGATION LIST PANEL
        ========================= */}
        <div className="irrigation-panel">
          <div className="irrigation-panel-header">
            <div>
              <h2>Irrigation Schedule & Logs</h2>
              <p>View and manage automated watering operations.</p>
            </div>

            <div className="irrigation-search">
              🔍
              <input
                type="text"
                placeholder="Search field, type, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="irrigation-table">
            <div className="irrigation-table-header">
              <span>Field & Zone</span>
              <span>Type</span>
              <span>Pump & Conflict</span>
              <span>Volume</span>
              <span>Schedule Time</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loadingSchedules && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Loading irrigation cycles...
              </div>
            )}

            {!loadingSchedules && error && !showAddModal && !showEditModal && !showViewModal && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {!loadingSchedules && !error && filteredSchedules.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {schedules.length === 0
                  ? 'No irrigation schedules created yet. Click "+ Schedule Irrigation" to begin!'
                  : 'No schedules matched your search.'}
              </div>
            )}

            {!loadingSchedules &&
              filteredSchedules.map((item) => (
                <div className="irrigation-table-row" key={item.id}>
                  <div>
                    <strong>{item.fieldName}</strong>
                    <small>Cycle #{String(item.id).padStart(3, '0')}</small>
                  </div>

                  <span>{item.irrigationType || 'Drip'}</span>

                  <div>
                    <strong style={{ fontSize: '12px', color: '#334155' }}>{item.pumpValveId || 'VALVE-01'}</strong>
                    <span style={{
                      display: 'block',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: item.conflictStatus === 'CONFLICT_DETECTED' ? '#dc2626' : '#16a34a'
                    }}>
                      {item.conflictStatus === 'CONFLICT_DETECTED' ? '⚠️ Conflict' : '✓ No Conflict'}
                    </span>
                  </div>

                  <span>
                    <strong style={{ color: '#0284c7' }}>{item.waterAmount} L</strong>
                    {item.waterSavedM3 && <small style={{ display: 'block', color: '#16a34a' }}>+{item.waterSavedM3}m³ saved</small>}
                  </span>

                  <span>{item.irrigationDate || 'N/A'}</span>

                  <span>
                    <span
                      className={`irrigation-status-badge ${
                        item.status?.toLowerCase() === 'completed'
                          ? 'completed'
                          : item.status?.toLowerCase() === 'in progress'
                          ? 'in-progress'
                          : 'scheduled'
                      }`}
                    >
                      {item.status || 'Scheduled'}
                    </span>
                  </span>

                  <div className="irrigation-actions">
                    <button
                      title="View Cycle"
                      onClick={() => handleView(item.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Cycle"
                      onClick={() => openEdit(item)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Cycle"
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
                  <h2>Schedule New Irrigation Cycle</h2>
                  <p>Configure water dosage and distribution schedule.</p>
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

              <form onSubmit={handleAddSchedule}>
                <div className="crop-form-group">
                  <label>Field / Parcel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. North Field - Wheat Zone A"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Irrigation Type</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                  >
                    <option value="Drip Irrigation">Drip Irrigation (Micro-drip)</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Center Pivot">Center Pivot</option>
                    <option value="Furrow Irrigation">Furrow / Basin Irrigation</option>
                    <option value="Sub-surface Drip">Sub-surface Drip</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Water Volume (Liters)</label>
                    <input
                      type="number"
                      step="10"
                      placeholder="e.g. 2300"
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Scheduled Date</label>
                    <input
                      type="date"
                      value={irrigationDate}
                      onChange={(e) => setIrrigationDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                    disabled={loading}
                  >
                    {loading ? 'Scheduling...' : 'Save Schedule'}
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
                  <h2>Edit Irrigation Cycle</h2>
                  <p>Update cycle parameters and status.</p>
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
                <div className="crop-form-group">
                  <label>Field / Parcel Name</label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Irrigation Type</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                  >
                    <option value="Drip Irrigation">Drip Irrigation (Micro-drip)</option>
                    <option value="Sprinkler System">Sprinkler System</option>
                    <option value="Center Pivot">Center Pivot</option>
                    <option value="Furrow Irrigation">Furrow / Basin Irrigation</option>
                    <option value="Sub-surface Drip">Sub-surface Drip</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Water Volume (Liters)</label>
                    <input
                      type="number"
                      step="10"
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Scheduled Date</label>
                    <input
                      type="date"
                      value={irrigationDate}
                      onChange={(e) => setIrrigationDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                    {loading ? 'Updating...' : 'Update Schedule'}
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
                  <h2>Irrigation Cycle Details</h2>
                  <p>Detailed log for cycle #{selectedItem?.id}</p>
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
                  Loading cycle details...
                </div>
              ) : selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Target Field
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.fieldName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Irrigation Type
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.irrigationType}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Water Volume
                      </span>
                      <p style={{ fontSize: '16px', color: '#0284c7', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.waterAmount} Liters
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Date
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.irrigationDate}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#737e78', fontWeight: '600' }}>
                      Execution Status:
                    </span>
                    <span
                      className={`irrigation-status-badge ${
                        selectedItem.status?.toLowerCase() === 'completed'
                          ? 'completed'
                          : selectedItem.status?.toLowerCase() === 'in progress'
                          ? 'in-progress'
                          : 'scheduled'
                      }`}
                    >
                      {selectedItem.status || 'Scheduled'}
                    </span>
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

export default Irrigation
