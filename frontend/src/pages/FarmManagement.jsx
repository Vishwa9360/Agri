import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './FarmManagement.css'

function FarmManagement() {
  const [showAddFarm, setShowAddFarm] = useState(false)
  const [showEditFarm, setShowEditFarm] = useState(false)
  const [showViewFarm, setShowViewFarm] = useState(false)

  const [farms, setFarms] = useState([])
  const [loadingFarms, setLoadingFarms] = useState(true)

  const [farmName, setFarmName] = useState('')
  const [farmerName, setFarmerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')

  // SRS Step 3-B Enhanced Farm Attributes
  const [farmCode, setFarmCode] = useState('')
  const [areaAcres, setAreaAcres] = useState('5.0')
  const [soilType, setSoilType] = useState('Loamy')
  const [waterSource, setWaterSource] = useState('Canal & Borewell')
  const [surveyNumber, setSurveyNumber] = useState('')
  const [latitude, setLatitude] = useState('19.9975')
  const [longitude, setLongitude] = useState('73.7898')
  const [detectingGps, setDetectingGps] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)

  const [editFarmId, setEditFarmId] = useState(null)
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [showImportCsv, setShowImportCsv] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importReport, setImportReport] = useState(null)

  const handleImportCsv = async (e) => {
    e.preventDefault()
    if (!csvFile) {
      alert('Please select a CSV file to import.')
      return
    }
    try {
      setImportLoading(true)
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', csvFile)
      const res = await api.post('/api/farms/import/csv', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setImportReport(res.data)
      loadFarms()
    } catch (err) {
      console.error('CSV import error:', err)
      alert(err.response?.data?.error || err.message || 'Failed to import CSV.')
    } finally {
      setImportLoading(false)
    }
  }

  const detectGpsCoordinates = () => {
    if (!navigator.geolocation) {
      alert('HTML5 Geolocation is not supported by your browser.')
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(4))
        setLongitude(pos.coords.longitude.toFixed(4))
        setDetectingGps(false)
      },
      (err) => {
        console.warn('Geolocation warning:', err)
        setLatitude('19.9975')
        setLongitude('73.7898')
        setDetectingGps(false)
      }
    )
  }

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true)
      const token = localStorage.getItem('token')
      const response = await api.get('/api/farms/export/csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'farm_holdings.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      console.error('Export CSV error:', e)
    } finally {
      setExportingCsv(false)
    }
  }

  const loadFarms = async () => {
    try {
      setLoadingFarms(true)

      const token = localStorage.getItem('token')

      const response = await api.get(
        '/farmer/getAll',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('FARMS FROM BACKEND:', response.data)

      setFarms(response.data)

    } catch (error) {
      console.error('GET FARMS ERROR:', error)

      if (error.response) {
        setError(
          `Failed to load farms. Server returned ${error.response.status}`
        )
      } else {
        setError('Cannot connect to backend.')
      }

    } finally {
      setLoadingFarms(false)
    }
  }
  useEffect(() => {
    loadFarms()
  }, [])
  const handleAddFarm = async (e) => {
    e.preventDefault()

    setError('')

    // SRS Appendix C Validation
    if (!farmerName || !farmerName.trim()) {
      setError('Name is required')
      return
    }
    const namePattern = /^[a-zA-Z\s]{2,100}$/
    if (!namePattern.test(farmerName.trim())) {
      setError('Name must not contain numbers or special characters')
      return
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      setError('Phone Number is required')
      return
    }
    const phonePattern = /^[0-9]{10}$/
    if (!phonePattern.test(phoneNumber.trim())) {
      setError('Phone Number must be exactly 10 digits long')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/farmer/create',
        {
          farmerName: farmerName.trim(),
          phoneNumber: phoneNumber.trim(),
          location: location.trim(),
          farmName: farmName.trim(),
          farmCode: farmCode.trim() || `FARM-00${farms.length + 1}`,
          areaAcres: parseFloat(areaAcres) || 5.0,
          soilType: soilType,
          waterSource: waterSource,
          surveyNumber: surveyNumber.trim() || 'SY-100',
          latitude: parseFloat(latitude) || 19.9975,
          longitude: parseFloat(longitude) || 73.7898,
          status: 'Active',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('FARM ADDED:', response.data)

      alert('Farm added successfully!')

      setFarmName('')
      setFarmerName('')
      setPhoneNumber('')
      setLocation('')

      setShowAddFarm(false)

      loadFarms()

    } catch (error) {
      console.error('ADD FARM ERROR:', error)

      if (error.response) {
        console.log('STATUS:', error.response.status)
        console.log('RESPONSE:', error.response.data)

        const errMsg = error.response.data?.message || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
        setError(`Validation Error: ${errMsg}`)
      } else if (error.request) {
        setError(
          'Cannot connect to backend. Please check if Spring Boot is running.'
        )

      } else {
        setError('Failed to send farm request.')
      }

    } finally {
      setLoading(false)
    }
  }

  // =========================
  // VIEW FARM (GET BY ID)
  // =========================

  const handleViewFarm = async (id) => {
    try {
      setViewLoading(true)
      setError('')
      setShowViewFarm(true)

      const token = localStorage.getItem('token')

      const response = await api.get(
        `/farmer/get/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('VIEW FARM DATA:', response.data)
      setSelectedFarm(response.data)

    } catch (error) {
      console.error('VIEW FARM ERROR:', error)

      if (error.response) {
        setError(
          `Failed to fetch farm details: Server returned ${error.response.status}`
        )
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

  const openEditFarm = (farm) => {
    setEditFarmId(farm.id)

    setFarmName(farm.farmName || '')
    setFarmerName(farm.farmerName || '')
    setPhoneNumber(farm.phoneNumber || '')
    setLocation(farm.location || '')

    setError('')
    setShowEditFarm(true)
  }


  const handleUpdateFarm = async (e) => {
    e.preventDefault()

    setError('')

    // SRS Appendix C Validation
    if (!farmerName || !farmerName.trim()) {
      setError('Name is required')
      return
    }
    const namePattern = /^[a-zA-Z\s]{2,100}$/
    if (!namePattern.test(farmerName.trim())) {
      setError('Name must not contain numbers or special characters')
      return
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      setError('Phone Number is required')
      return
    }
    const phonePattern = /^[0-9]{10}$/
    if (!phonePattern.test(phoneNumber.trim())) {
      setError('Phone Number must be exactly 10 digits long')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/farmer/update/${editFarmId}`,
        {
          farmerName: farmerName,
          phoneNumber: phoneNumber,
          location: location,
          farmName: farmName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('FARM UPDATED:', response.data)

      alert('Farm updated successfully!')

      setFarmName('')
      setFarmerName('')
      setPhoneNumber('')
      setLocation('')
      setEditFarmId(null)

      setShowEditFarm(false)

      loadFarms()

    } catch (error) {
      console.error('UPDATE FARM ERROR:', error)

      if (error.response) {
        console.log('STATUS:', error.response.status)
        console.log('RESPONSE:', error.response.data)

        const errMsg = error.response.data?.message || (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
        setError(`Validation Error: ${errMsg}`)
      } else if (error.request) {
        setError(
          'Cannot connect to backend. Please check if Spring Boot is running.'
        )

      } else {
        setError('Failed to update farm.')
      }

    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE FARM
  // =========================

  const handleDeleteFarm = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this farm?'
    )

    if (!confirmDelete) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      await api.delete(
        `/farmer/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert('Farm deleted successfully!')

      loadFarms()

    } catch (error) {
      console.error('DELETE FARM ERROR:', error)

      if (error.response) {
        setError(
          `Failed to delete farm. Server returned ${error.response.status}`
        )
      } else {
        setError('Cannot connect to backend.')
      }
    }
  }

  // =========================
  // RESET / CLOSE MODALS
  // =========================

  const closeAddModal = () => {
    setShowAddFarm(false)

    setFarmName('')
    setFarmerName('')
    setPhoneNumber('')
    setLocation('')

    setError('')
  }

  const closeEditModal = () => {
    setShowEditFarm(false)

    setFarmName('')
    setFarmerName('')
    setPhoneNumber('')
    setLocation('')
    setEditFarmId(null)

    setError('')
  }

  const closeViewModal = () => {
    setShowViewFarm(false)
    setSelectedFarm(null)
    setError('')
  }

  // Filter farms by search term
  const filteredFarms = farms.filter((farm) => {
    const term = searchTerm.toLowerCase()
    return (
      (farm.farmName && farm.farmName.toLowerCase().includes(term)) ||
      (farm.farmerName && farm.farmerName.toLowerCase().includes(term)) ||
      (farm.location && farm.location.toLowerCase().includes(term)) ||
      (farm.phoneNumber && farm.phoneNumber.includes(term))
    )
  })

  return (
    <Layout>

      <div className="farm-management-page">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="farm-management-header">

          <div>
            <h1>Farm Management</h1>

            <p>
              Manage your farms and current agricultural activities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="add-farm-btn"
              style={{ background: '#059669' }}
              onClick={() => {
                setImportReport(null)
                setShowImportCsv(true)
              }}
            >
              📤 Import CSV
            </button>
            <button
              className="add-farm-btn"
              style={{ background: '#0284c7' }}
              onClick={handleExportCsv}
              disabled={exportingCsv}
            >
              {exportingCsv ? 'Exporting...' : '📥 Export CSV'}
            </button>
            <button
              className="add-farm-btn"
              onClick={() => {
                setError('')
                setShowAddFarm(true)
              }}
            >
              + Add Farm
            </button>
          </div>

        </div>


        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="farm-summary">

          <div className="farm-summary-card">
            <span>Total Farms</span>
            <h2>{farms.length}</h2>
            <p>Registered farms</p>
          </div>

          <div className="farm-summary-card">
            <span>Total Area</span>
            <h2>12.4 ha</h2>
            <p>Across all farms</p>
          </div>

          <div className="farm-summary-card">
            <span>Active Crops</span>
            <h2>3</h2>
            <p>Currently growing</p>
          </div>

          <div className="farm-summary-card">
            <span>Farm Health</span>
            <h2>87.5%</h2>
            <p>Average health</p>
          </div>

        </div>


        {/* =========================
            FARM LIST
        ========================= */}

        <div className="farm-management-panel">

          <div className="farm-panel-header">

            <div>
              <h2>Farm List</h2>

              <p>
                View and manage your registered farms.
              </p>
            </div>

            <div className="farm-search">

              🔍

              <input
                type="text"
                placeholder="Search farms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

            </div>

          </div>


          <div className="farm-table">

            {/* TABLE HEADER */}

            <div className="farm-table-header">

              <span>FARM NAME</span>
              <span>FARMER</span>
              <span>PHONE</span>
              <span>LOCATION</span>
              <span>HEALTH</span>
              <span>STATUS</span>
              <span>ACTIONS</span>

            </div>


            {/* LOADING */}

            {loadingFarms && (

              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: '#78837d'
                }}
              >
                Loading farms...
              </div>

            )}


            {/* ERROR */}

            {!loadingFarms && error && !showAddFarm && !showEditFarm && !showViewFarm && (

              <div
                style={{
                  padding: '20px',
                  color: '#dc2626',
                  background: '#fef2f2'
                }}
              >
                {error}
              </div>

            )}


            {/* NO FARMS */}

            {!loadingFarms &&
              !error &&
              filteredFarms.length === 0 && (

                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#78837d'
                  }}
                >
                  {farms.length === 0
                    ? 'No farms found. Click "+ Add Farm" to create your first farm.'
                    : 'No farms matched your search.'}
                </div>

              )}


            {/* FARM DATA */}

            {!loadingFarms &&
              filteredFarms.map((farm) => (

                <div
                  className="farm-table-row"
                  key={farm.id}
                >

                  <div>
                    <strong>
                      {farm.farmName}
                    </strong>

                    <small>
                      Farm {String(farm.id).padStart(3, '0')}
                    </small>
                  </div>


                  <span>
                    {farm.farmerName}
                  </span>


                  <span>
                    {farm.phoneNumber}
                  </span>


                  <span>
                    {farm.location}
                  </span>


                  <span className="health">

                    <span className="health-line"></span>

                    100%

                  </span>


                  <span className="farm-status active">
                    Active
                  </span>


                  <div className="farm-actions">

                    <button
                      title="View"
                      onClick={() => handleViewFarm(farm.id)}
                    >
                      👁
                    </button>


                    <button
                      title="Edit"
                      onClick={() => openEditFarm(farm)}
                    >
                      ✏️
                    </button>


                    <button
                      title="Delete"
                      onClick={() => handleDeleteFarm(farm.id)}
                    >
                      🗑
                    </button>

                  </div>

                </div>

              ))}

          </div>

        </div>


        {/* =========================
            ADD FARM MODAL
        ========================= */}

        {showAddFarm && (

          <div
            className="farm-modal-overlay"
            onClick={closeAddModal}
          >

            <div
              className="farm-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="farm-modal-header">

                <div>

                  <h2>
                    Add New Farm
                  </h2>

                  <p>
                    Enter the details of your new farm.
                  </p>

                </div>


                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={closeAddModal}
                >
                  ✕
                </button>

              </div>


              {error && (

                <p
                  style={{
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}
                >
                  {error}
                </p>

              )}


              <form onSubmit={handleAddFarm}>

                <div className="farm-form-group">

                  <label>
                    Farm Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farm name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Farmer Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farmer name"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farm location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />

                </div>

                <div className="farm-form-group">
                  <label>Farm Code / Parcel Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. FARM-003"
                    value={farmCode}
                    onChange={(e) => setFarmCode(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="farm-form-group">
                    <label>Area (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 6.5"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(e.target.value)}
                      required
                    />
                  </div>

                  <div className="farm-form-group">
                    <label>Soil Type</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Loamy">Loamy Soil</option>
                      <option value="Clay">Clay Soil</option>
                      <option value="Black Soil">Black Cotton Soil</option>
                      <option value="Sandy">Sandy Loam</option>
                      <option value="Alluvial">Alluvial Soil</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="farm-form-group">
                    <label>Water Source</label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Canal & Drip">Canal & Drip</option>
                      <option value="Borewell">Borewell</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Canal & Borewell">Canal & Borewell</option>
                      <option value="River Lift">River Lift</option>
                    </select>
                  </div>

                  <div className="farm-form-group">
                    <label>Survey Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SY-104/A"
                      value={surveyNumber}
                      onChange={(e) => setSurveyNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                  <div className="farm-form-group">
                    <label>GPS Latitude</label>
                    <input
                      type="text"
                      placeholder="e.g. 19.9975"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </div>
                  <div className="farm-form-group">
                    <label>GPS Longitude</label>
                    <input
                      type="text"
                      placeholder="e.g. 73.7898"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={detectGpsCoordinates}
                  disabled={detectingGps}
                  style={{ width: '100%', padding: '8px 12px', background: '#ecfdf5', color: '#047857', border: '1px dashed #059669', borderRadius: '6px', fontSize: '13px', fontWeight: '500', marginBottom: '16px', cursor: 'pointer' }}
                >
                  {detectingGps ? 'Detecting via GPS...' : '📍 Auto-Detect Current GPS Coordinates (HTML5)'}
                </button>


                <div className="farm-form-actions">

                  <button
                    type="button"
                    className="cancel-farm-btn"
                    onClick={closeAddModal}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="save-farm-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Farm'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* =========================
            EDIT FARM MODAL
        ========================= */}

        {showEditFarm && (

          <div
            className="farm-modal-overlay"
            onClick={closeEditModal}
          >

            <div
              className="farm-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="farm-modal-header">

                <div>

                  <h2>
                    Edit Farm
                  </h2>

                  <p>
                    Update your farm details.
                  </p>

                </div>


                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={closeEditModal}
                >
                  ✕
                </button>

              </div>


              {error && (

                <p
                  style={{
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}
                >
                  {error}
                </p>

              )}


              <form onSubmit={handleUpdateFarm}>

                <div className="farm-form-group">

                  <label>
                    Farm Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farm name"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Farmer Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farmer name"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    placeholder="Enter farm location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />

                </div>


                <div className="farm-form-actions">

                  <button
                    type="button"
                    className="cancel-farm-btn"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="save-farm-btn"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Farm'}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* =========================
            VIEW FARM MODAL
        ========================= */}

        {showViewFarm && (

          <div
            className="farm-modal-overlay"
            onClick={closeViewModal}
          >

            <div
              className="farm-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="farm-modal-header">

                <div>

                  <h2>
                    View Farm Details
                  </h2>

                  <p>
                    Detailed information of the selected farm.
                  </p>

                </div>


                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={closeViewModal}
                >
                  ✕
                </button>

              </div>


              {error && (

                <p
                  style={{
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    wordBreak: 'break-word',
                  }}
                >
                  {error}
                </p>

              )}


              {viewLoading ? (

                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#78837d',
                  }}
                >
                  Loading farm details...
                </div>

              ) : selectedFarm ? (

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Farm Name
                      </span>
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#20372a',
                          fontWeight: '600',
                          margin: '4px 0 0',
                        }}
                      >
                        {selectedFarm.farmName || 'N/A'}
                      </p>
                    </div>

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Farmer Name
                      </span>
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#20372a',
                          fontWeight: '600',
                          margin: '4px 0 0',
                        }}
                      >
                        {selectedFarm.farmerName || 'N/A'}
                      </p>
                    </div>

                  </div>


                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Phone Number
                      </span>
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#20372a',
                          fontWeight: '600',
                          margin: '4px 0 0',
                        }}
                      >
                        {selectedFarm.phoneNumber || 'N/A'}
                      </p>
                    </div>

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Location
                      </span>
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#20372a',
                          fontWeight: '600',
                          margin: '4px 0 0',
                        }}
                      >
                        {selectedFarm.location || 'N/A'}
                      </p>
                    </div>

                  </div>


                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Health
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '6px',
                        }}
                      >
                        <span className="health-line"></span>
                        <strong
                          style={{
                            fontSize: '13px',
                            color: '#2f8f46',
                          }}
                        >
                          100% (Good)
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f7f9f8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #edf0ee',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#737e78',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Status
                      </span>
                      <div style={{ marginTop: '6px' }}>
                        <span className="farm-status active">
                          Active
                        </span>
                      </div>
                    </div>

                  </div>


                  <div
                    className="farm-form-actions"
                    style={{ marginTop: '10px' }}
                  >

                    <button
                      type="button"
                      className="save-farm-btn"
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

        {/* =========================
            IMPORT CSV MODAL (SRS FR4 / Step 3-B)
        ========================= */}
        {showImportCsv && (
          <div className="farm-modal-overlay">
            <div className="farm-modal" style={{ maxWidth: '600px' }}>
              <div className="farm-modal-header">
                <div>
                  <h2>Import Farm Holdings CSV</h2>
                  <p>Bulk upload farm parcels with survey number & field validation.</p>
                </div>
                <button
                  className="close-modal-btn"
                  onClick={() => {
                    setShowImportCsv(false)
                    setImportReport(null)
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleImportCsv}>
                <div style={{ padding: '20px' }}>
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    marginBottom: '16px'
                  }}>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      style={{ marginBottom: '8px' }}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Expected columns: FarmName, FarmerName, Phone, Location, AreaAcres, SoilType, WaterSource, SurveyNumber
                    </p>
                  </div>

                  {importReport && (
                    <div style={{
                      background: importReport.failedRowsCount > 0 ? '#fffbeb' : '#f0fdf4',
                      border: `1px solid ${importReport.failedRowsCount > 0 ? '#fde68a' : '#bbf7d0'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                      fontSize: '13px'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: importReport.failedRowsCount > 0 ? '#b45309' : '#15803d' }}>
                        Import Complete: {importReport.successfulImports} added, {importReport.failedRowsCount} failed
                      </h4>
                      <p style={{ margin: 0 }}>Total rows processed: {importReport.totalRowsProcessed}</p>
                      {importReport.errors && importReport.errors.length > 0 && (
                        <div style={{ marginTop: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                          <strong>Validation Errors:</strong>
                          <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', color: '#b91c1c' }}>
                            {importReport.errors.map((err, idx) => (
                              <li key={idx}>Row {err.row}: {err.reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="farm-form-actions">
                    <button
                      type="button"
                      className="cancel-farm-btn"
                      onClick={() => {
                        setShowImportCsv(false)
                        setImportReport(null)
                      }}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="save-farm-btn"
                      disabled={importLoading || !csvFile}
                      style={{ background: '#059669' }}
                    >
                      {importLoading ? 'Uploading & Validating...' : 'Upload & Import'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </Layout>
  )
}

export default FarmManagement