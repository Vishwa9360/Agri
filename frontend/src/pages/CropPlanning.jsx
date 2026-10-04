import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './CropPlanning.css'

function CropPlanning() {
  const [crops, setCrops] = useState([])
  const [loadingCrops, setLoadingCrops] = useState(true)

  const [showAddCrop, setShowAddCrop] = useState(false)
  const [showEditCrop, setShowEditCrop] = useState(false)
  const [showViewCrop, setShowViewCrop] = useState(false)

  // Form Fields
  const [cropName, setCropName] = useState('')
  const [cropType, setCropType] = useState('Cereal')
  const [season, setSeason] = useState('Kharif')
  const [soilType, setSoilType] = useState('Clay Loam')
  const [quantity, setQuantity] = useState('')

  // Enhanced SRS Crop Lifecycle & Yield Fields
  const [variety, setVariety] = useState('HD-2967')
  const [sowingDate, setSowingDate] = useState('')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('')
  const [targetYield, setTargetYield] = useState('')
  const [actualYield, setActualYield] = useState('')
  const [areaAcres, setAreaAcres] = useState('5.0')
  const [farmId, setFarmId] = useState('1')
  const [farms, setFarms] = useState([])

  const [editCropId, setEditCropId] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleStageTransition = async (cropId, newStage) => {
    try {
      const token = localStorage.getItem('token')
      await api.put(`/api/crop-seasons/${cropId}/stage`, { stage: newStage }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadCrops()
    } catch (err) {
      console.error('Failed to transition stage:', err)
    }
  }
  const loadCrops = async () => {
    try {
      setLoadingCrops(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/crop/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('CROPS FROM BACKEND:', response.data)
      setCrops(response.data)
    } catch (err) {
      console.error('GET CROPS ERROR:', err)
      if (err.response) {
        setError(`Failed to load crops (Server returned ${err.response.status})`)
      } else {
        setError('Cannot connect to backend. Please make sure Spring Boot is running.')
      }
    } finally {
      setLoadingCrops(false)
    }
  }

  useEffect(() => {
    loadCrops()
  }, [])

 
  const handleAddCrop = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/crop/create',
        {
          cropName: cropName.trim(),
          cropType: cropType,
          season: season,
          soilType: soilType,
          quantity: parseInt(quantity) || 5,
          farmId: parseInt(farmId) || 1,
          variety: variety.trim(),
          sowingDate: sowingDate || new Date().toISOString().split('T')[0],
          expectedHarvestDate: expectedHarvestDate || '',
          areaAcres: parseFloat(areaAcres) || 5.0,
          status: 'Sown',
          targetYield: parseFloat(targetYield) || 5000.0,
          actualYield: parseFloat(actualYield) || 0.0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('CROP CREATED:', response.data)
      alert('Crop plan added successfully!')

      closeAddModal()
      loadCrops()
    } catch (err) {
      console.error('ADD CROP ERROR:', err)
      if (err.response) {
        setError(`Failed to add crop: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // VIEW CROP (GET BY ID)
  // =========================
  const handleViewCrop = async (id) => {
    try {
      setViewLoading(true)
      setError('')
      setShowViewCrop(true)

      const token = localStorage.getItem('token')

      const response = await api.get(`/crop/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW CROP DATA:', response.data)
      setSelectedCrop(response.data)
    } catch (err) {
      console.error('VIEW CROP ERROR:', err)
      if (err.response) {
        setError(`Failed to load crop details: Server returned ${err.response.status}`)
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
  const openEditCrop = (crop) => {
    setEditCropId(crop.id)
    setCropName(crop.cropName || '')
    setCropType(crop.cropType || 'Cereal')
    setSeason(crop.season || 'Kharif')
    setSoilType(crop.soilType || 'Clay Loam')
    setQuantity(crop.quantity ? String(crop.quantity) : '')
    setError('')
    setShowEditCrop(true)
  }

  // =========================
  // UPDATE CROP
  // =========================
  const handleUpdateCrop = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/crop/update/${editCropId}`,
        {
          cropName: cropName,
          cropType: cropType,
          season: season,
          soilType: soilType,
          quantity: parseInt(quantity) || 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('CROP UPDATED:', response.data)
      alert('Crop plan updated successfully!')

      closeEditModal()
      loadCrops()
    } catch (err) {
      console.error('UPDATE CROP ERROR:', err)
      if (err.response) {
        setError(`Failed to update crop: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE CROP
  // =========================
  const handleDeleteCrop = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this crop plan?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/crop/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Crop plan deleted successfully!')
      loadCrops()
    } catch (err) {
      console.error('DELETE CROP ERROR:', err)
      if (err.response) {
        setError(`Failed to delete crop: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    }
  }

  // Close modals
  const closeAddModal = () => {
    setShowAddCrop(false)
    setCropName('')
    setCropType('Cereal')
    setSeason('Kharif')
    setSoilType('Clay Loam')
    setQuantity('')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditCrop(false)
    setEditCropId(null)
    setCropName('')
    setCropType('Cereal')
    setSeason('Kharif')
    setSoilType('Clay Loam')
    setQuantity('')
    setError('')
  }

  const closeViewModal = () => {
    setShowViewCrop(false)
    setSelectedCrop(null)
    setError('')
  }

  // Search filtering
  const filteredCrops = crops.filter((crop) => {
    const term = searchTerm.toLowerCase()
    return (
      (crop.cropName && crop.cropName.toLowerCase().includes(term)) ||
      (crop.cropType && crop.cropType.toLowerCase().includes(term)) ||
      (crop.season && crop.season.toLowerCase().includes(term)) ||
      (crop.soilType && crop.soilType.toLowerCase().includes(term))
    )
  })

  // Summary counts
  const kharifCount = crops.filter(
    (c) => c.season && c.season.toLowerCase() === 'kharif'
  ).length
  const rabiCount = crops.filter(
    (c) => c.season && c.season.toLowerCase() === 'rabi'
  ).length
  const totalQuantity = crops.reduce((sum, c) => sum + (c.quantity || 0), 0)

  return (
    <Layout>
      <div className="crop-planning-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="crop-planning-header">
          <div>
            <h1>Crop Planning</h1>
            <p>Plan crop seasons, varieties, and yield expectations.</p>
          </div>

          <button
            className="add-crop-btn"
            onClick={() => {
              setError('')
              setShowAddCrop(true)
            }}
          >
            <span>+</span> Add Crop Plan
          </button>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <div className="crop-summary">
          <div className="crop-summary-card">
            <span>Total Planned Crops</span>
            <h2>{crops.length}</h2>
            <p>Across active seasons</p>
          </div>

          <div className="crop-summary-card">
            <span>Kharif Season</span>
            <h2>{kharifCount}</h2>
            <p>Monsoon sowing crops</p>
          </div>

          <div className="crop-summary-card">
            <span>Rabi Season</span>
            <h2>{rabiCount}</h2>
            <p>Winter sowing crops</p>
          </div>

          <div className="crop-summary-card">
            <span>Total Quantity</span>
            <h2>{totalQuantity}</h2>
            <p>Quintals / units planned</p>
          </div>
        </div>

        {/* =========================
            CROP LIST PANEL
        ========================= */}
        <div className="crop-panel">
          <div className="crop-panel-header">
            <div>
              <h2>Crop Schedule & Variety</h2>
              <p>View, manage, and plan crop lifecycles.</p>
            </div>

            <div className="crop-search">
              🔍
              <input
                type="text"
                placeholder="Search crops, season, soil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="crop-table">
            {/* Table Header */}
            <div className="crop-table-header">
              <span>Crop Name</span>
              <span>Crop Type</span>
              <span>Season</span>
              <span>Growth Stage</span>
              <span>Quantity</span>
              <span>Actions</span>
            </div>

            {/* Loading */}
            {loadingCrops && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Loading crop plans...
              </div>
            )}

            {/* Error */}
            {!loadingCrops && error && !showAddCrop && !showEditCrop && !showViewCrop && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {/* No Crops */}
            {!loadingCrops && !error && filteredCrops.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {crops.length === 0
                  ? 'No crops planned yet. Click "+ Add Crop Plan" to create your first one!'
                  : 'No crop plans matched your search.'}
              </div>
            )}

            {/* Crop Rows */}
            {!loadingCrops &&
              filteredCrops.map((crop) => (
                <div className="crop-table-row" key={crop.id}>
                  <div>
                    <strong>{crop.cropName}</strong>
                    <small>{crop.variety ? `${crop.variety} • ` : ''}Crop #{String(crop.id).padStart(3, '0')}</small>
                  </div>

                  <span>{crop.cropType || 'General'}</span>

                  <span>
                    <span
                      className={`season-badge ${
                        crop.season?.toLowerCase() === 'kharif'
                          ? 'kharif'
                          : crop.season?.toLowerCase() === 'rabi'
                          ? 'rabi'
                          : 'zaid'
                      }`}
                    >
                      {crop.season || 'Regular'}
                    </span>
                  </span>

                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: crop.status === 'Harvested' ? '#dcfce7' : '#e0f2fe',
                      color: crop.status === 'Harvested' ? '#15803d' : '#0369a1',
                      marginBottom: '4px'
                    }}>
                      {crop.status || 'Sown'}
                    </span>
                    {crop.status !== 'Harvested' && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = crop.status === 'Sown' ? 'Vegetative'
                            : crop.status === 'Vegetative' ? 'Flowering'
                            : crop.status === 'Flowering' ? 'Maturity'
                            : 'Harvested';
                          handleStageTransition(crop.id, next);
                        }}
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          color: '#0f172a'
                        }}
                      >
                        → {crop.status === 'Sown' ? 'Vegetative' : crop.status === 'Vegetative' ? 'Flowering' : crop.status === 'Flowering' ? 'Maturity' : 'Harvested'}
                      </button>
                    )}
                  </div>

                  <span>
                    <strong>{crop.quantity}</strong>
                    <small>units</small>
                  </span>

                  <div className="crop-actions">
                    <button
                      title="View Details"
                      onClick={() => handleViewCrop(crop.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Crop"
                      onClick={() => openEditCrop(crop)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Crop"
                      onClick={() => handleDeleteCrop(crop.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* =========================
            ADD CROP MODAL
        ========================= */}
        {showAddCrop && (
          <div className="crop-modal-overlay" onClick={closeAddModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Add Crop Plan</h2>
                  <p>Register a new crop for the season.</p>
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

              <form onSubmit={handleAddCrop}>
                <div className="crop-form-group">
                  <label>Crop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Basmati Rice, Cotton"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Crop Type</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                  >
                    <option value="Cereal">Cereal</option>
                    <option value="Grain">Grain</option>
                    <option value="Pulse">Pulse</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Cash Crop">Cash Crop</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="Kharif">Kharif (Monsoon / Autumn)</option>
                    <option value="Rabi">Rabi (Winter / Spring)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Year-round">Year-round</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Soil Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Clay Loam, Black Soil, Alluvial"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Planned Quantity (Quintals / Units)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
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
                    {loading ? 'Saving...' : 'Save Crop Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            EDIT CROP MODAL
        ========================= */}
        {showEditCrop && (
          <div className="crop-modal-overlay" onClick={closeEditModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Edit Crop Plan</h2>
                  <p>Update crop planning details.</p>
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

              <form onSubmit={handleUpdateCrop}>
                <div className="crop-form-group">
                  <label>Crop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Basmati Rice"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Crop Type</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                  >
                    <option value="Cereal">Cereal</option>
                    <option value="Grain">Grain</option>
                    <option value="Pulse">Pulse</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Cash Crop">Cash Crop</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    <option value="Kharif">Kharif (Monsoon / Autumn)</option>
                    <option value="Rabi">Rabi (Winter / Spring)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Year-round">Year-round</option>
                  </select>
                </div>

                <div className="crop-form-group">
                  <label>Soil Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Clay Loam, Black Soil"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Planned Quantity (Quintals / Units)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
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
                    {loading ? 'Updating...' : 'Update Crop Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            VIEW CROP DETAILS MODAL
        ========================= */}
        {showViewCrop && (
          <div className="crop-modal-overlay" onClick={closeViewModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Crop Plan Details</h2>
                  <p>Detailed specifications for this crop.</p>
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
                  onClick={closeViewModal}
                >
                  ✕
                </button>
              </div>

              {viewLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                  Loading crop details...
                </div>
              ) : selectedCrop ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Crop Name
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedCrop.cropName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Crop Type
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedCrop.cropType}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Season
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedCrop.season}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Soil Requirement
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedCrop.soilType}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                    <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                      Target Quantity / Expected Yield
                    </span>
                    <p style={{ fontSize: '16px', color: '#2f8f46', fontWeight: '700', margin: '4px 0 0' }}>
                      {selectedCrop.quantity} Quintals / Units
                    </p>
                  </div>

                  <div className="crop-form-actions" style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      className="save-crop-btn"
                      onClick={closeViewModal}
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

export default CropPlanning
