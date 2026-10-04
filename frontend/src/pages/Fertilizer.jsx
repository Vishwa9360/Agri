import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './Fertilizer.css'

function Fertilizer() {
  const [fertilizers, setFertilizers] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Form Fields
  const [fertilizerName, setFertilizerName] = useState('')
  const [fertilizerType, setFertilizerType] = useState('NPK Complex')
  const [cropName, setCropName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [applicationDate, setApplicationDate] = useState('')
  const [status, setStatus] = useState('Scheduled')

  const [editId, setEditId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('fertilizer') // 'fertilizer' | 'pesticide' | 'npk_calc'

  // NPK Soil Calculator State
  const [soilN, setSoilN] = useState(210)
  const [soilP, setSoilP] = useState(35)
  const [soilK, setSoilK] = useState(180)
  const [farmAcres, setFarmAcres] = useState(5.0)
  const [npkResult, setNpkResult] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)

  // =========================
  // CALCULATE NPK DEFICIT
  // =========================
  const handleCalculateNpk = async (e) => {
    if (e) e.preventDefault()
    setCalcLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await api.post(
        '/api/fertilizer/calculate-npk',
        {
          nitrogen: parseFloat(soilN) || 0,
          phosphorus: parseFloat(soilP) || 0,
          potassium: parseFloat(soilK) || 0,
          acres: parseFloat(farmAcres) || 1.0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setNpkResult(res.data)
    } catch (err) {
      console.error('NPK CALC ERROR:', err)
      // Fallback calculation if backend unreachable
      const defN = Math.max(0, 280 - (parseFloat(soilN) || 0))
      const defP = Math.max(0, 60 - (parseFloat(soilP) || 0))
      const defK = Math.max(0, 240 - (parseFloat(soilK) || 0))
      const ac = parseFloat(farmAcres) || 1.0
      const urea = Math.round((defN / 0.46 / 50.0 * (ac / 2.47)) * 10.0) / 10.0
      const dap = Math.round((defP / 0.46 / 50.0 * (ac / 2.47)) * 10.0) / 10.0
      const mop = Math.round((defK / 0.60 / 50.0 * (ac / 2.47)) * 10.0) / 10.0
      setNpkResult({
        currentSoilNutrients: { nitrogen: soilN, phosphorus: soilP, potassium: soilK },
        targetNutrients: { nitrogen: 280, phosphorus: 60, potassium: 240 },
        nutrientDeficitKgHa: { nitrogenDeficit: defN, phosphorusDeficit: defP, potassiumDeficit: defK },
        commercialRecommendations: [
          { fertilizer: 'Urea (46% N)', quantityBags50kg: urea, schedule: 'Split 50% Basal + 50% Top dressing at 30 DAS' },
          { fertilizer: 'DAP (18-46-0)', quantityBags50kg: dap, schedule: '100% Basal at sowing' },
          { fertilizer: 'MOP (60% K2O)', quantityBags50kg: mop, schedule: '100% Basal at land preparation' },
        ],
        applicationNotes: 'Incorporate organic vermicompost @ 2 tons/acre to enhance nutrient retention and microbial activity.',
      })
    } finally {
      setCalcLoading(false)
    }
  }

  // Auto-fill Add modal from NPK calculation
  const applyNpkToSchedule = (rec) => {
    setFertilizerName(rec.fertilizer)
    setFertilizerType(rec.fertilizer.includes('Urea') ? 'Nitrogenous' : rec.fertilizer.includes('DAP') ? 'Phosphatic' : 'Potassic')
    setQuantity(String(Math.round(rec.quantityBags50kg * 50)))
    setCropName('General Field')
    setApplicationDate(new Date().toISOString().split('T')[0])
    setStatus('Scheduled')
    setShowAddModal(true)
  }

  // =========================
  // LOAD FERTILIZER DATA
  // =========================
  const loadFertilizers = async () => {
    try {
      setLoadingList(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/fertilizer/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('FERTILIZER DATA:', response.data)
      setFertilizers(response.data)
    } catch (err) {
      console.error('GET FERTILIZER ERROR:', err)
      if (err.response) {
        setError(`Failed to load fertilizer schedules (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadFertilizers()
  }, [])

  // =========================
  // ADD FERTILIZER PLAN
  // =========================
  const handleAddFertilizer = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/fertilizer/create',
        {
          fertilizerName: fertilizerName,
          fertilizerType: fertilizerType,
          cropName: cropName,
          quantity: parseFloat(quantity) || 0,
          applicationDate: applicationDate,
          status: status,
          recommendedDose: parseFloat(quantity) || 50.0,
          targetNutrient: fertilizerType.includes('Nitrogen') ? 'Nitrogen' : fertilizerType.includes('Phosphat') ? 'Phosphorus' : 'NPK',
          unit: 'kg/acre',
          phiDays: 14,
          farmId: 1,
          seasonId: 1,
          recommendationType: fertilizerType.toLowerCase().includes('pesticide') ? 'PESTICIDE' : 'FERTILIZER',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('FERTILIZER CREATED:', response.data)
      alert('Fertilizer schedule added successfully!')

      closeAddModal()
      loadFertilizers()
    } catch (err) {
      console.error('ADD FERTILIZER ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to add fertilizer schedule.')
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

      const response = await api.get(`/fertilizer/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW FERTILIZER DATA:', response.data)
      setSelectedItem(response.data)
    } catch (err) {
      console.error('VIEW FERTILIZER ERROR:', err)
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
    setFertilizerName(item.fertilizerName || '')
    setFertilizerType(item.fertilizerType || 'NPK Complex')
    setCropName(item.cropName || '')
    setQuantity(item.quantity !== undefined ? String(item.quantity) : '')
    setApplicationDate(item.applicationDate || '')
    setStatus(item.status || 'Scheduled')
    setError('')
    setShowEditModal(true)
  }

  // =========================
  // UPDATE FERTILIZER
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/fertilizer/update/${editId}`,
        {
          fertilizerName: fertilizerName,
          fertilizerType: fertilizerType,
          cropName: cropName,
          quantity: parseFloat(quantity) || 0,
          applicationDate: applicationDate,
          status: status,
          recommendedDose: parseFloat(quantity) || 50.0,
          targetNutrient: fertilizerType.includes('Nitrogen') ? 'Nitrogen' : fertilizerType.includes('Phosphat') ? 'Phosphorus' : 'NPK',
          unit: 'kg/acre',
          phiDays: 14,
          farmId: 1,
          seasonId: 1,
          recommendationType: fertilizerType.toLowerCase().includes('pesticide') ? 'PESTICIDE' : 'FERTILIZER',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('FERTILIZER UPDATED:', response.data)
      alert('Fertilizer schedule updated successfully!')

      closeEditModal()
      loadFertilizers()
    } catch (err) {
      console.error('UPDATE FERTILIZER ERROR:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update fertilizer schedule.')
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE FERTILIZER
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this fertilizer record?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/fertilizer/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Fertilizer schedule deleted successfully!')
      loadFertilizers()
    } catch (err) {
      console.error('DELETE FERTILIZER ERROR:', err)
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
    setFertilizerName('')
    setFertilizerType('NPK Complex')
    setCropName('')
    setQuantity('')
    setApplicationDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditId(null)
    setFertilizerName('')
    setFertilizerType('NPK Complex')
    setCropName('')
    setQuantity('')
    setApplicationDate('')
    setStatus('Scheduled')
    setError('')
  }

  const closeView = () => {
    setShowViewModal(false)
    setSelectedItem(null)
    setError('')
  }

  // Search filter
  const filteredFertilizers = fertilizers.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      (item.fertilizerName && item.fertilizerName.toLowerCase().includes(term)) ||
      (item.fertilizerType && item.fertilizerType.toLowerCase().includes(term)) ||
      (item.cropName && item.cropName.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    )
  })

  // Calculations
  const totalKg = fertilizers.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const appliedCount = fertilizers.filter((item) => item.status?.toLowerCase() === 'applied').length
  const scheduledCount = fertilizers.filter((item) => item.status?.toLowerCase() === 'scheduled').length
  const pendingCount = fertilizers.filter((item) => item.status?.toLowerCase() === 'pending').length

  return (
    <Layout>
      <div className="fertilizer-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="fertilizer-header">
          <div>
            <h1>Fertilizer & Nutrition</h1>
            <p>Plan crop nutrients, NPK dosage schedules, and application records.</p>
          </div>

          <button
            className="add-fertilizer-btn"
            onClick={() => {
              setError('')
              setShowAddModal(true)
            }}
          >
            <span>+</span> Add Fertilizer Plan
          </button>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <div className="fertilizer-summary">
          <div className="fertilizer-summary-card">
            <span>Total Applications</span>
            <h2>{fertilizers.length}</h2>
            <p>Scheduled & applied</p>
          </div>

          <div className="fertilizer-summary-card">
            <span>Total Quantity</span>
            <h2>{totalKg.toLocaleString()} kg</h2>
            <p>Total nutrient dosage</p>
          </div>

          <div className="fertilizer-summary-card">
            <span>Applied</span>
            <h2>{appliedCount}</h2>
            <p>Completed field doses</p>
          </div>

          <div className="fertilizer-summary-card">
            <span>Upcoming / Due</span>
            <h2>{scheduledCount + pendingCount}</h2>
            <p>Scheduled nutrition cycles</p>
          </div>
        </div>

        {/* =========================
            NAVIGATION TABS
        ========================= */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === 'fertilizer' ? '2px solid #2f8f46' : '1px solid #d1d5db',
              background: activeTab === 'fertilizer' ? '#eaf5ed' : '#ffffff',
              color: activeTab === 'fertilizer' ? '#1b5e20' : '#4b5563',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('fertilizer')}
          >
            🌱 Fertilizer Schedules ({fertilizers.filter(f => !f.fertilizerType?.toLowerCase().includes('pesticide')).length})
          </button>

          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === 'pesticide' ? '2px solid #2f8f46' : '1px solid #d1d5db',
              background: activeTab === 'pesticide' ? '#eaf5ed' : '#ffffff',
              color: activeTab === 'pesticide' ? '#1b5e20' : '#4b5563',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('pesticide')}
          >
            🧪 Pesticide & Chemical Log ({fertilizers.filter(f => f.fertilizerType?.toLowerCase().includes('pesticide')).length})
          </button>

          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === 'npk_calc' ? '2px solid #2f8f46' : '1px solid #d1d5db',
              background: activeTab === 'npk_calc' ? '#eaf5ed' : '#ffffff',
              color: activeTab === 'npk_calc' ? '#1b5e20' : '#4b5563',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              setActiveTab('npk_calc')
              if (!npkResult) handleCalculateNpk()
            }}
          >
            🧮 Soil NPK Prescription Engine
          </button>
        </div>

        {/* =========================
            NPK CALCULATOR VIEW
        ========================= */}
        {activeTab === 'npk_calc' ? (
          <div className="fertilizer-panel">
            <div className="fertilizer-panel-header">
              <div>
                <h2>🧮 Precision Soil NPK Deficit & Commercial Bag Calculator</h2>
                <p>Computes scientific soil deficit against ICAR optimal levels and prescribes commercial Urea, DAP, and MOP bag requirements.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Soil Nitrogen - N (kg/ha)</label>
                <input
                  type="number"
                  value={soilN}
                  onChange={(e) => setSoilN(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Target: 280 kg/ha</span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Soil Phosphorus - P (kg/ha)</label>
                <input
                  type="number"
                  value={soilP}
                  onChange={(e) => setSoilP(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Target: 60 kg/ha</span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Soil Potassium - K (kg/ha)</label>
                <input
                  type="number"
                  value={soilK}
                  onChange={(e) => setSoilK(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Target: 240 kg/ha</span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Parcel Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={farmAcres}
                  onChange={(e) => setFarmAcres(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Farm size for scale</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCalculateNpk}
                  disabled={calcLoading}
                  style={{ width: '100%', background: '#2f8f46', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {calcLoading ? 'Computing...' : '⚡ Calculate Prescription'}
                </button>
              </div>
            </div>

            {npkResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Deficit metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '600' }}>NITROGEN (N) DEFICIT</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#b91c1c', marginTop: '4px' }}>
                      {npkResult.nutrientDeficitKgHa?.nitrogenDeficit || 0} kg/ha
                    </div>
                    <div style={{ fontSize: '11px', color: '#7f1d1d', marginTop: '4px' }}>Current: {soilN} kg/ha vs Target: 280 kg/ha</div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600' }}>PHOSPHORUS (P) DEFICIT</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#d97706', marginTop: '4px' }}>
                      {npkResult.nutrientDeficitKgHa?.phosphorusDeficit || 0} kg/ha
                    </div>
                    <div style={{ fontSize: '11px', color: '#78350f', marginTop: '4px' }}>Current: {soilP} kg/ha vs Target: 60 kg/ha</div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>POTASSIUM (K) DEFICIT</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb', marginTop: '4px' }}>
                      {npkResult.nutrientDeficitKgHa?.potassiumDeficit || 0} kg/ha
                    </div>
                    <div style={{ fontSize: '11px', color: '#1e3a8a', marginTop: '4px' }}>Current: {soilK} kg/ha vs Target: 240 kg/ha</div>
                  </div>
                </div>

                {/* Commercial dosage recommendations */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
                  <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '12px' }}>📦 Prescribed Commercial Fertilizer Bags ({farmAcres} Acres)</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {npkResult.commercialRecommendations?.map((rec, i) => (
                      <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '15px', color: '#0f172a' }}>{rec.fertilizer}</strong>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                            {rec.quantityBags50kg} Bags (50kg)
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0' }}><strong>Application Protocol:</strong> {rec.schedule}</p>
                        <button
                          type="button"
                          onClick={() => applyNpkToSchedule(rec)}
                          style={{ fontSize: '11px', background: '#2f8f46', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ➕ Add to Fertilizer Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                  {npkResult.applicationNotes && (
                    <div style={{ marginTop: '14px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                      ℹ️ <strong>Agronomist Note:</strong> {npkResult.applicationNotes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================
              FERTILIZER / PESTICIDE LIST PANEL
          ========================= */
          <div className="fertilizer-panel">
            <div className="fertilizer-panel-header">
              <div>
                <h2>{activeTab === 'pesticide' ? 'Pesticide & Chemical Crop Protection Log' : 'Nutrient Application Schedule'}</h2>
                <p>{activeTab === 'pesticide' ? 'Monitor chemical application, target pests, and pre-harvest intervals.' : 'Manage fertilizer types, target crops, and application dates.'}</p>
              </div>

              <div className="fertilizer-search">
                🔍
                <input
                  type="text"
                  placeholder="Search inputs, crop, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="fertilizer-table">
              <div className="fertilizer-table-header">
                <span>Input / Fertilizer</span>
                <span>Type</span>
                <span>Target Crop</span>
                <span>Dosage</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {loadingList && (
                <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                  Loading input schedules...
                </div>
              )}

              {!loadingList && error && !showAddModal && !showEditModal && !showViewModal && (
                <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                  {error}
                </div>
              )}

              {!loadingList && !error && filteredFertilizers
                .filter(item => activeTab === 'pesticide' ? item.fertilizerType?.toLowerCase().includes('pesticide') : !item.fertilizerType?.toLowerCase().includes('pesticide'))
                .length === 0 && (
                <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                  {fertilizers.length === 0
                    ? `No ${activeTab === 'pesticide' ? 'pesticide' : 'fertilizer'} schedules recorded. Click "+ Add Fertilizer Plan" to begin!`
                    : `No ${activeTab === 'pesticide' ? 'pesticide' : 'fertilizer'} records matched your search.`}
                </div>
              )}

              {!loadingList &&
                filteredFertilizers
                  .filter(item => activeTab === 'pesticide' ? item.fertilizerType?.toLowerCase().includes('pesticide') : !item.fertilizerType?.toLowerCase().includes('pesticide'))
                  .map((item) => (
                    <div className="fertilizer-table-row" key={item.id}>
                      <div>
                        <strong>{item.fertilizerName}</strong>
                        <small>Plan #{String(item.id).padStart(3, '0')}</small>
                      </div>

                      <span>{item.fertilizerType || 'NPK'}</span>

                      <span>
                        <strong>{item.cropName || 'General'}</strong>
                      </span>

                      <span>
                        <strong style={{ color: '#2f8f46' }}>{item.quantity} kg</strong>
                      </span>

                      <span>
                        <span
                          className={`fertilizer-status-badge ${
                            item.status?.toLowerCase() === 'applied'
                              ? 'applied'
                              : item.status?.toLowerCase() === 'scheduled'
                              ? 'scheduled'
                              : 'pending'
                          }`}
                        >
                          {item.status || 'Scheduled'}
                        </span>
                      </span>

                      <div className="fertilizer-actions">
                        <button
                          title="View Plan"
                          onClick={() => handleView(item.id)}
                        >
                          👁
                        </button>

                        <button
                          title="Edit Plan"
                          onClick={() => openEdit(item)}
                        >
                          ✏️
                        </button>

                        <button
                          title="Delete Plan"
                          onClick={() => handleDelete(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* =========================
            ADD MODAL
        ========================= */}
        {showAddModal && (
          <div className="crop-modal-overlay" onClick={closeAddModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Add Fertilizer Schedule</h2>
                  <p>Prescribe nutrient dosage for your crops.</p>
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

              <form onSubmit={handleAddFertilizer}>
                <div className="crop-form-group">
                  <label>Fertilizer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Urea 46%, NPK 10:26:26, DAP 18-46-0"
                    value={fertilizerName}
                    onChange={(e) => setFertilizerName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Fertilizer Type</label>
                  <select
                    value={fertilizerType}
                    onChange={(e) => setFertilizerType(e.target.value)}
                  >
                    <option value="NPK Complex">NPK Complex</option>
                    <option value="Nitrogenous">Nitrogenous (Urea/Ammonium)</option>
                    <option value="Phosphatic">Phosphatic (DAP/SSP)</option>
                    <option value="Potassic">Potassic (MOP/SOP)</option>
                    <option value="Bio-fertilizer">Bio-fertilizer / Organic</option>
                    <option value="Micronutrient">Zinc / Boron Micronutrients</option>
                    <option value="Pesticide">Pesticide / Crop Protection</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Target Crop</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Basmati Rice, Corn"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Dosage Quantity (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 50"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Application Date</label>
                    <input
                      type="date"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
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
                    <option value="Applied">Applied</option>
                    <option value="Pending">Pending</option>
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
                    {loading ? 'Saving...' : 'Save Fertilizer Plan'}
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
                  <h2>Edit Fertilizer Schedule</h2>
                  <p>Update nutrient dosage and application records.</p>
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
                  <label>Fertilizer Name</label>
                  <input
                    type="text"
                    value={fertilizerName}
                    onChange={(e) => setFertilizerName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Fertilizer Type</label>
                  <select
                    value={fertilizerType}
                    onChange={(e) => setFertilizerType(e.target.value)}
                  >
                    <option value="NPK Complex">NPK Complex</option>
                    <option value="Nitrogenous">Nitrogenous (Urea/Ammonium)</option>
                    <option value="Phosphatic">Phosphatic (DAP/SSP)</option>
                    <option value="Potassic">Potassic (MOP/SOP)</option>
                    <option value="Bio-fertilizer">Bio-fertilizer / Organic</option>
                    <option value="Micronutrient">Zinc / Boron Micronutrients</option>
                    <option value="Pesticide">Pesticide / Crop Protection</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Target Crop</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Dosage Quantity (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Application Date</label>
                    <input
                      type="date"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
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
                    <option value="Applied">Applied</option>
                    <option value="Pending">Pending</option>
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
                    {loading ? 'Updating...' : 'Update Plan'}
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
                  <h2>Fertilizer Plan Details</h2>
                  <p>Detailed dosage and nutrition profile for plan #{selectedItem?.id}</p>
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
                  Loading plan details...
                </div>
              ) : selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Fertilizer Name
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.fertilizerName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Nutrient Type
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.fertilizerType}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Target Crop
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedItem.cropName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Dosage Quantity
                      </span>
                      <p style={{ fontSize: '16px', color: '#2f8f46', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.quantity} kg
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Application Date
                      </span>
                      <p style={{ fontSize: '14px', color: '#20372a', fontWeight: '600', margin: '3px 0 0' }}>
                        {selectedItem.applicationDate}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        Status
                      </span>
                      <span
                        className={`fertilizer-status-badge ${
                          selectedItem.status?.toLowerCase() === 'applied'
                            ? 'applied'
                            : selectedItem.status?.toLowerCase() === 'scheduled'
                            ? 'scheduled'
                            : 'pending'
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

export default Fertilizer
