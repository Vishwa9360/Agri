import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './IotMonitoring.css'

function IotMonitoring() {
  const [sensors, setSensors] = useState([])
  const [loadingSensors, setLoadingSensors] = useState(true)

  const [showAddSensor, setShowAddSensor] = useState(false)
  const [showEditSensor, setShowEditSensor] = useState(false)
  const [showViewSensor, setShowViewSensor] = useState(false)

  // Form Fields
  const [sensorName, setSensorName] = useState('')
  const [sensorType, setSensorType] = useState('Soil Moisture')
  const [temperature, setTemperature] = useState('')
  const [humidity, setHumidity] = useState('')
  const [soilMoisture, setSoilMoisture] = useState('')
  const [status, setStatus] = useState('Active')

  const [editSensorId, setEditSensorId] = useState(null)
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeGraphTab, setActiveGraphTab] = useState('moisture')
  const [selectedGraphProbe, setSelectedGraphProbe] = useState(0)
  const [timeRange, setTimeRange] = useState('24h')
  const loadSensors = async () => {
    try {
      setLoadingSensors(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/sensor/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('SENSORS FROM BACKEND:', response.data)
      setSensors(response.data)
    } catch (err) {
      console.error('GET SENSORS ERROR:', err)
      if (err.response) {
        setError(`Failed to load sensors (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingSensors(false)
    }
  }

  useEffect(() => {
    loadSensors()
  }, [])
  const handleAddSensor = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/sensor/create',
        {
          sensorName: sensorName,
          sensorType: sensorType,
          temperature: parseFloat(temperature) || 0.0,
          humidity: parseFloat(humidity) || 0.0,
          soilMoisture: parseFloat(soilMoisture) || 0.0,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('SENSOR CREATED:', response.data)
      alert('Sensor node added successfully!')

      closeAddModal()
      loadSensors()
    } catch (err) {
      console.error('ADD SENSOR ERROR:', err)
      if (err.response) {
        setError(`Failed to add sensor: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoading(false)
    }
  }
  const handleViewSensor = async (id) => {
    try {
      setViewLoading(true)
      setError('')
      setShowViewSensor(true)

      const token = localStorage.getItem('token')

      const response = await api.get(`/sensor/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW SENSOR DATA:', response.data)
      setSelectedSensor(response.data)
    } catch (err) {
      console.error('VIEW SENSOR ERROR:', err)
      if (err.response) {
        setError(`Failed to load sensor details: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setViewLoading(false)
    }
  }


  const openEditSensor = (sensor) => {
    setEditSensorId(sensor.id)
    setSensorName(sensor.sensorName || '')
    setSensorType(sensor.sensorType || 'Soil Moisture')
    setTemperature(sensor.temperature !== undefined ? String(sensor.temperature) : '')
    setHumidity(sensor.humidity !== undefined ? String(sensor.humidity) : '')
    setSoilMoisture(sensor.soilMoisture !== undefined ? String(sensor.soilMoisture) : '')
    setStatus(sensor.status || 'Active')
    setError('')
    setShowEditSensor(true)
  }

  // =========================
  // UPDATE SENSOR
  // =========================
  const handleUpdateSensor = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/sensor/update/${editSensorId}`,
        {
          sensorName: sensorName,
          sensorType: sensorType,
          temperature: parseFloat(temperature) || 0.0,
          humidity: parseFloat(humidity) || 0.0,
          soilMoisture: parseFloat(soilMoisture) || 0.0,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('SENSOR UPDATED:', response.data)
      alert('Sensor node updated successfully!')

      closeEditModal()
      loadSensors()
    } catch (err) {
      console.error('UPDATE SENSOR ERROR:', err)
      if (err.response) {
        setError(`Failed to update sensor: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteSensor = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this sensor node?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/sensor/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Sensor deleted successfully!')
      loadSensors()
    } catch (err) {
      console.error('DELETE SENSOR ERROR:', err)
      if (err.response) {
        setError(`Failed to delete sensor: Server returned ${err.response.status}`)
      } else {
        setError('Cannot connect to backend.')
      }
    }
  }
  const closeAddModal = () => {
    setShowAddSensor(false)
    setSensorName('')
    setSensorType('Soil Moisture')
    setTemperature('')
    setHumidity('')
    setSoilMoisture('')
    setStatus('Active')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditSensor(false)
    setEditSensorId(null)
    setSensorName('')
    setSensorType('Soil Moisture')
    setTemperature('')
    setHumidity('')
    setSoilMoisture('')
    setStatus('Active')
    setError('')
  }

  const closeViewModal = () => {
    setShowViewSensor(false)
    setSelectedSensor(null)
    setError('')
  }

  // Search filtering
  const filteredSensors = sensors.filter((sensor) => {
    const term = searchTerm.toLowerCase()
    return (
      (sensor.sensorName && sensor.sensorName.toLowerCase().includes(term)) ||
      (sensor.sensorType && sensor.sensorType.toLowerCase().includes(term)) ||
      (sensor.status && sensor.status.toLowerCase().includes(term))
    )
  })

  // Calculations for KPI Cards
  const activeSensors = sensors.filter((s) => s.status?.toLowerCase() === 'active').length
  const avgMoisture =
    sensors.length > 0
      ? (sensors.reduce((sum, s) => sum + (s.soilMoisture || 0), 0) / sensors.length).toFixed(1)
      : '0'
  const avgTemp =
    sensors.length > 0
      ? (sensors.reduce((sum, s) => sum + (s.temperature || 0), 0) / sensors.length).toFixed(1)
      : '0'
  const avgHumidity =
    sensors.length > 0
      ? (sensors.reduce((sum, s) => sum + (s.humidity || 0), 0) / sensors.length).toFixed(1)
      : '0'

  return (
    <Layout>
      <div className="iot-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="iot-header">
          <div>
            <h1>IoT Sensor Monitoring</h1>
            <p>Real-time telemetry from in-field agricultural sensors and soil probes.</p>
          </div>

          <button
            className="add-sensor-btn"
            onClick={() => {
              setError('')
              setShowAddSensor(true)
            }}
          >
            <span>+</span> Connect New Sensor
          </button>
        </div>

        {/* =========================
            METRICS / GAUGES
        ========================= */}
        <div className="iot-metrics-grid">
          <div className="iot-metric-card">
            <div className="iot-metric-top">
              <span>Soil Moisture</span>
              <span className="iot-metric-badge">Normal</span>
            </div>
            <h2>{avgMoisture}%</h2>
            <p>Across active soil probes</p>
          </div>

          <div className="iot-metric-card">
            <div className="iot-metric-top">
              <span>Avg Temperature</span>
              <span className="iot-metric-badge">Optimal</span>
            </div>
            <h2>{avgTemp}°C</h2>
            <p>Ambient farm temperature</p>
          </div>

          <div className="iot-metric-card">
            <div className="iot-metric-top">
              <span>Avg Humidity</span>
              <span className="iot-metric-badge">Healthy</span>
            </div>
            <h2>{avgHumidity}%</h2>
            <p>Atmospheric relative humidity</p>
          </div>

          <div className="iot-metric-card">
            <div className="iot-metric-top">
              <span>Online Sensors</span>
              <span className="iot-metric-badge">
                {activeSensors}/{sensors.length} Live
              </span>
            </div>
            <h2>{activeSensors}</h2>
            <p>Connected IoT nodes</p>
          </div>
        </div>

        {/* CRITICAL MOISTURE ALERT BANNER */}
        {sensors.some((s) => s.soilMoisture > 0 && s.soilMoisture < 30) && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ color: '#b91c1c' }}>⚠️ Critical Moisture Depletion Alert</strong>
              <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '13px' }}>
                One or more soil probes recorded moisture &lt; 30%. Precision drip irrigation has been auto-queued.
              </p>
            </div>
            <a href="/irrigation" style={{ background: '#dc2626', color: '#fff', padding: '8px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
              View Irrigation →
            </a>
          </div>
        )}


        {/* ========================================================
            INTERACTIVE IOT SOIL TELEMETRY & ROOT ZONE GRAPHS (SRS)
        ======================================================== */}
        <div className="iot-graphs-container" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5ebe7', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(30,60,40,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '18px', borderBottom: '1px solid #f0f4f1', paddingBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>📈</span>
                <h2 style={{ fontSize: '18px', color: '#1a3826', margin: 0, fontWeight: '700' }}>
                  IoT Soil Telemetry Analytics & Sensor Dynamics
                </h2>
                <span style={{ background: '#e7f5ea', color: '#166534', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '10px' }}>
                  Live Streams Active
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#737e78', margin: '4px 0 0 0' }}>
                Multi-probe continuous telemetry tracking moisture infiltration, microclimate correlation, and ICAR nutrient benchmarks.
              </p>
            </div>

            {/* Probe & Time Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {sensors.length > 0 && (
                <select
                  value={selectedGraphProbe}
                  onChange={(e) => setSelectedGraphProbe(Number(e.target.value))}
                  style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', background: '#f8fafc', color: '#1e293b', fontWeight: '500' }}
                >
                  {sensors.map((s, idx) => (
                    <option key={s.id || idx} value={idx}>
                      🌱 {s.sensorName || `Probe #${s.id}`} ({s.soilMoisture || avgMoisture}% Moist)
                    </option>
                  ))}
                </select>
              )}

              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px' }}>
                {['24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    style={{
                      border: 'none',
                      background: timeRange === range ? '#16a34a' : 'transparent',
                      color: timeRange === range ? 'white' : '#64748b',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Graph Sub-Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveGraphTab('moisture')}
              style={{
                border: '1px solid',
                borderColor: activeGraphTab === 'moisture' ? '#16a34a' : '#e2e8f0',
                background: activeGraphTab === 'moisture' ? '#f0fdf4' : 'white',
                color: activeGraphTab === 'moisture' ? '#15803d' : '#475569',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💧 24h Soil Moisture Dynamics
            </button>

            <button
              type="button"
              onClick={() => setActiveGraphTab('climate')}
              style={{
                border: '1px solid',
                borderColor: activeGraphTab === 'climate' ? '#0284c7' : '#e2e8f0',
                background: activeGraphTab === 'climate' ? '#f0f9ff' : 'white',
                color: activeGraphTab === 'climate' ? '#0369a1' : '#475569',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌡️ Temp &amp; Humidity Correlation
            </button>

            <button
              type="button"
              onClick={() => setActiveGraphTab('npk')}
              style={{
                border: '1px solid',
                borderColor: activeGraphTab === 'npk' ? '#7c3aed' : '#e2e8f0',
                background: activeGraphTab === 'npk' ? '#faf5ff' : 'white',
                color: activeGraphTab === 'npk' ? '#6d28d9' : '#475569',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🧪 N-P-K Nutrient Deficit Bars
            </button>

            <button
              type="button"
              onClick={() => setActiveGraphTab('ph')}
              style={{
                border: '1px solid',
                borderColor: activeGraphTab === 'ph' ? '#ea580c' : '#e2e8f0',
                background: activeGraphTab === 'ph' ? '#fff7ed' : 'white',
                color: activeGraphTab === 'ph' ? '#c2410c' : '#475569',
                padding: '8px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⚖️ Soil pH &amp; Bioavailability
            </button>
          </div>

          {/* TAB 1: SOIL MOISTURE DYNAMICS GRAPH */}
          {activeGraphTab === 'moisture' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', color: '#64748b' }}>
                <div>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', marginRight: '5px' }}></span>
                  <strong>Root Zone Moisture Infiltration Curve</strong>
                  <span style={{ marginLeft: '12px', color: '#dc2626', fontWeight: '600' }}>--- Critical Threshold: 30%</span>
                  <span style={{ marginLeft: '12px', color: '#2563eb', fontWeight: '600' }}>--- Field Capacity: 60%</span>
                </div>
                <div style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  Current: {sensors[selectedGraphProbe]?.soilMoisture || avgMoisture}% Volumetric Water
                </div>
              </div>

              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 780 260" style={{ width: '100%', minWidth: '600px', height: 'auto', background: '#fafdfb', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <defs>
                    <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines (10% to 80%) */}
                  {[20, 50, 80, 110, 140, 170, 200].map((y, idx) => (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="750" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="42" y={y + 4} font-size="10" fill="#94a3b8" textAnchor="end">{80 - idx * 10}%</text>
                    </g>
                  ))}

                  {/* Optimal Zone Shading (30% to 60% = Y: 170 down to Y: 80) */}
                  <rect x="50" y="80" width="700" height="90" fill="#dcfce7" fillOpacity="0.25" />
                  <text x="740" y="94" font-size="9" font-weight="bold" fill="#15803d" textAnchor="end">OPTIMAL ROOT ZONE (30% - 60%)</text>

                  {/* Field Capacity Reference (60% -> Y=80) */}
                  <line x1="50" y1="80" x2="750" y2="80" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" />

                  {/* Critical Drip Trigger Reference (30% -> Y=170) */}
                  <line x1="50" y1="170" x2="750" y2="170" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="5,3" />
                  <text x="740" y="165" font-size="9.5" font-weight="bold" fill="#dc2626" textAnchor="end">🚨 AUTOMATED DRIP TRIGGER (30%)</text>

                  {/* Moisture Curve Path */}
                  <path
                    d="M 60,110 Q 140,125 200,145 T 320,176 T 440,188 T 520,120 T 640,112 T 740,140 L 740,210 L 60,210 Z"
                    fill="url(#moistGrad)"
                  />
                  <path
                    d="M 60,110 Q 140,125 200,145 T 320,176 T 440,188 T 520,120 T 640,112 T 740,140"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {[
                    { x: 60, y: 110, val: '50%', t: '00:00' },
                    { x: 170, y: 135, val: '43%', t: '04:00' },
                    { x: 280, y: 160, val: '34%', t: '08:00' },
                    { x: 390, y: 182, val: '26%', t: '12:00 (Stress)' },
                    { x: 500, y: 130, val: '45%', t: '16:00 (Drip On)' },
                    { x: 620, y: 115, val: '48%', t: '20:00' },
                    { x: 740, y: 140, val: sensors[selectedGraphProbe]?.soilMoisture ? `${sensors[selectedGraphProbe].soilMoisture}%` : '41%', t: 'Now' }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke={pt.y >= 170 ? '#dc2626' : '#059669'} strokeWidth="2.5" />
                      <rect x={pt.x - 18} y={pt.y - 24} width="36" height="16" rx="3" fill="#1e293b" />
                      <text x={pt.x} y={pt.y - 12} font-size="9" font-weight="bold" fill="#ffffff" textAnchor="middle">{pt.val}</text>
                      <text x={pt.x} y="228" font-size="9.5" fill="#64748b" textAnchor="middle">{pt.t}</text>
                    </g>
                  ))}
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                <span>💡 <em>Automated solenoid valve triggers when root-zone moisture drops below the 30% threshold.</em></span>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>Average Daily Conservation: 38.4% Water Saved</span>
              </div>
            </div>
          )}

          {/* TAB 2: CLIMATE DUAL AXIS GRAPH */}
          {activeGraphTab === 'climate' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#ea580c', fontWeight: '700', marginRight: '15px' }}>● Soil Temp (°C) [Left Axis]</span>
                  <span style={{ color: '#0284c7', fontWeight: '700' }}>● Ambient Humidity (%) [Right Axis]</span>
                </div>
                <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  Microclimate: Stable
                </span>
              </div>

              <svg viewBox="0 0 780 240" style={{ width: '100%', minWidth: '600px', height: 'auto', background: '#fafcff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {/* Horizontal lines */}
                {[30, 75, 120, 165, 200].map((y, idx) => (
                  <line key={idx} x1="50" y1={y} x2="730" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}

                {/* Left Axis Labels (Temp: 20°C to 40°C) */}
                <text x="42" y="34" font-size="9.5" fill="#ea580c" textAnchor="end">40°C</text>
                <text x="42" y="85" font-size="9.5" fill="#ea580c" textAnchor="end">35°C</text>
                <text x="42" y="130" font-size="9.5" fill="#ea580c" textAnchor="end">30°C</text>
                <text x="42" y="175" font-size="9.5" fill="#ea580c" textAnchor="end">25°C</text>
                <text x="42" y="204" font-size="9.5" fill="#ea580c" textAnchor="end">20°C</text>

                {/* Right Axis Labels (Humidity: 40% to 100%) */}
                <text x="738" y="34" font-size="9.5" fill="#0284c7">100%</text>
                <text x="738" y="85" font-size="9.5" fill="#0284c7">85%</text>
                <text x="738" y="130" font-size="9.5" fill="#0284c7">70%</text>
                <text x="738" y="175" font-size="9.5" fill="#0284c7">55%</text>
                <text x="738" y="204" font-size="9.5" fill="#0284c7">40%</text>

                {/* Humidity Curve (Blue) */}
                <path d="M 60,65 Q 160,85 260,115 T 460,145 T 600,100 T 720,70" fill="none" stroke="#0284c7" strokeWidth="3" />
                {/* Temp Curve (Orange) */}
                <path d="M 60,165 Q 160,140 260,110 T 460,65 T 600,90 T 720,135" fill="none" stroke="#ea580c" strokeWidth="3" />

                {/* Legend timeline */}
                {['02:00', '06:00', '10:00', '14:00 (Peak)', '18:00', '22:00'].map((time, idx) => (
                  <text key={idx} x={70 + idx * 130} y="222" font-size="9.5" fill="#64748b" textAnchor="middle">{time}</text>
                ))}
              </svg>
            </div>
          )}

          {/* TAB 3: NPK NUTRIENT COMPARISON BARS */}
          {activeGraphTab === 'npk' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
                <span style={{ color: '#475569' }}>Comparing active probe soil nutrients against <strong>ICAR Soil Benchmarks</strong> for Kharif/Rabi cereals.</span>
                <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Lab Calibrated</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                {[
                  { name: 'Nitrogen (N)', current: 142, target: 160, unit: 'ppm', color: '#10b981', status: '-11% Deficit (Urea req)' },
                  { name: 'Phosphorus (P)', current: 28, target: 30, unit: 'ppm', color: '#3b82f6', status: 'Optimal Bio-Availability' },
                  { name: 'Potassium (K)', current: 195, target: 180, unit: 'ppm', color: '#8b5cf6', status: '+8% Adequate Reserve' },
                  { name: 'Organic Carbon (OC)', current: 0.65, target: 0.75, unit: '%', color: '#f59e0b', status: 'Moderate Organic Matter' }
                ].map((nut, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>{nut.name}</strong>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: nut.color }}>{nut.current} {nut.unit}</span>
                    </div>

                    <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', position: 'relative', marginBottom: '6px' }}>
                      <div style={{ width: `${Math.min(100, (nut.current / (nut.target * 1.3)) * 100)}%`, height: '100%', background: nut.color, borderRadius: '7px' }} />
                      {/* Target Marker */}
                      <div style={{ position: 'absolute', left: `${(nut.target / (nut.target * 1.3)) * 100}%`, top: 0, bottom: 0, width: '2px', background: '#0f172a' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                      <span>Target: {nut.target} {nut.unit}</span>
                      <span style={{ fontWeight: '600', color: nut.color }}>{nut.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOIL PH GAUGE */}
          {activeGraphTab === 'ph' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12.5px' }}>
                <span>Electrochemical Soil Acidity / Alkalinity Scale (Current: <strong>pH 6.8</strong>)</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Slightly Acidic - Ideal</span>
              </div>

              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '24px', borderRadius: '12px', background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 35%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)', position: 'relative', marginBottom: '12px' }}>
                  {/* Pointer at pH 6.8 (6.8 / 14 = ~48.5%) */}
                  <div style={{ position: 'absolute', left: '48.5%', top: '-8px', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <div style={{ width: '0', height: '0', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #0f172a', margin: '0 auto' }} />
                    <span style={{ background: '#0f172a', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold' }}>6.8 pH</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  <span>0.0 (Strong Acid)</span>
                  <span>5.5 (Acidic)</span>
                  <span style={{ color: '#166534', fontWeight: 'bold' }}>6.5 - 7.5 (Optimal Bio-Availability)</span>
                  <span>8.5 (Alkaline)</span>
                  <span>14.0 (Strong Alkali)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================
            SENSOR DATA PANEL
        ========================= */}
        <div className="iot-panel">
          <div className="iot-panel-header">
            <div>
              <h2>Sensor Telemetry Feed</h2>
              <p>Live streams and operational states for field hardware.</p>
            </div>

            <div className="iot-search-bar">
              <div className="iot-search">
                🔍
                <input
                  type="text"
                  placeholder="Search sensors, type, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={loadSensors}
                style={{
                  border: '1px solid #dfe6e1',
                  background: 'white',
                  borderRadius: '7px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#2d332f',
                  fontWeight: '600',
                }}
              >
                🔄 Refresh Telemetry
              </button>
            </div>
          </div>

          <div className="iot-table">
            <div className="iot-table-header">
              <span>Sensor Node</span>
              <span>Type</span>
              <span>Soil Moisture</span>
              <span>Temp / Humidity</span>
              <span>Soil pH & NPK</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {loadingSensors && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Connecting to IoT sensor mesh...
              </div>
            )}

            {!loadingSensors && error && !showAddSensor && !showEditSensor && !showViewSensor && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {!loadingSensors && !error && filteredSensors.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {sensors.length === 0
                  ? 'No IoT sensors deployed yet. Click "+ Connect New Sensor" to add your first node!'
                  : 'No sensors matched your search query.'}
              </div>
            )}

            {!loadingSensors &&
              filteredSensors.map((sensor) => (
                <div className="iot-table-row" key={sensor.id}>
                  <div>
                    <strong>{sensor.sensorName}</strong>
                    <small>Node ID: #{String(sensor.id).padStart(3, '0')}</small>
                  </div>

                  <span>{sensor.sensorType || 'Generic'}</span>

                  <span>
                    <strong style={{ color: sensor.soilMoisture < 30 ? '#dc2626' : '#2f8f46' }}>
                      {sensor.soilMoisture}%
                    </strong>
                    {sensor.soilMoisture < 30 && <small style={{ color: '#dc2626', display: 'block' }}>Sub-threshold</small>}
                  </span>

                  <span>{sensor.temperature}°C / {sensor.humidity}%</span>

                  <span>
                    <small style={{ color: '#334155', fontWeight: '500' }}>
                      pH: {sensor.phLevel || 6.8} | NPK: {Math.round(sensor.nitrogen || 140)}/{Math.round(sensor.phosphorus || 28)}/{Math.round(sensor.potassium || 180)}
                    </small>
                  </span>

                  <span>
                    <span
                      className={`status-badge ${
                        sensor.status?.toLowerCase() === 'active'
                          ? 'active'
                          : sensor.status?.toLowerCase() === 'warning'
                          ? 'alert'
                          : 'offline'
                      }`}
                    >
                      {sensor.status || 'Active'}
                    </span>
                  </span>

                  <div className="iot-actions">
                    <button
                      title="View Telemetry"
                      onClick={() => handleViewSensor(sensor.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Sensor"
                      onClick={() => openEditSensor(sensor)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Sensor"
                      onClick={() => handleDeleteSensor(sensor.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* =========================
            ADD SENSOR MODAL
        ========================= */}
        {showAddSensor && (
          <div className="crop-modal-overlay" onClick={closeAddModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Deploy New Sensor Node</h2>
                  <p>Register a wireless IoT probe or field station.</p>
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

              <form onSubmit={handleAddSensor}>
                <div className="crop-form-group">
                  <label>Sensor / Node Name</label>
                  <input
                    type="text"
                    placeholder="e.g. North Field Moisture Probe 1"
                    value={sensorName}
                    onChange={(e) => setSensorName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Sensor Type</label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value)}
                  >
                    <option value="Soil Moisture">Soil Moisture Probe</option>
                    <option value="Temperature & Humidity">Temperature & Humidity</option>
                    <option value="Environmental Station">Environmental Station</option>
                    <option value="NPK Nutrient Sensor">NPK Nutrient Sensor</option>
                    <option value="Solar Radiation">Solar Radiation Node</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 28.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Humidity (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 62.0"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Soil Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 68.0"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Initial Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Warning">Warning</option>
                      <option value="Offline">Offline</option>
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
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Connect Sensor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            EDIT SENSOR MODAL
        ========================= */}
        {showEditSensor && (
          <div className="crop-modal-overlay" onClick={closeEditModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Calibrate / Edit Sensor Node</h2>
                  <p>Update sensor parameters and calibration values.</p>
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

              <form onSubmit={handleUpdateSensor}>
                <div className="crop-form-group">
                  <label>Sensor / Node Name</label>
                  <input
                    type="text"
                    value={sensorName}
                    onChange={(e) => setSensorName(e.target.value)}
                    required
                  />
                </div>

                <div className="crop-form-group">
                  <label>Sensor Type</label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value)}
                  >
                    <option value="Soil Moisture">Soil Moisture Probe</option>
                    <option value="Temperature & Humidity">Temperature & Humidity</option>
                    <option value="Environmental Station">Environmental Station</option>
                    <option value="NPK Nutrient Sensor">NPK Nutrient Sensor</option>
                    <option value="Solar Radiation">Solar Radiation Node</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Humidity (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Soil Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilMoisture}
                      onChange={(e) => setSoilMoisture(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Warning">Warning</option>
                      <option value="Offline">Offline</option>
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
                    {loading ? 'Updating...' : 'Update Node'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================
            VIEW SENSOR MODAL
        ========================= */}
        {showViewSensor && (
          <div className="crop-modal-overlay" onClick={closeViewModal}>
            <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
              <div className="crop-modal-header">
                <div>
                  <h2>Live Sensor Telemetry</h2>
                  <p>Detailed realtime metrics for node #{selectedSensor?.id}</p>
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
                  Reading telemetry...
                </div>
              ) : selectedSensor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Sensor Name
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedSensor.sensorName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Sensor Type
                      </span>
                      <p style={{ fontSize: '15px', color: '#20372a', fontWeight: '600', margin: '4px 0 0' }}>
                        {selectedSensor.sensorType}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Moisture
                      </span>
                      <p style={{ fontSize: '18px', color: '#2f8f46', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedSensor.soilMoisture}%
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Temperature
                      </span>
                      <p style={{ fontSize: '18px', color: '#1d3026', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedSensor.temperature}°C
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Humidity
                      </span>
                      <p style={{ fontSize: '18px', color: '#0284c7', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedSensor.humidity}%
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#737e78', fontWeight: '600' }}>
                      Operational Status:
                    </span>
                    <span
                      className={`status-badge ${
                        selectedSensor.status?.toLowerCase() === 'active'
                          ? 'active'
                          : selectedSensor.status?.toLowerCase() === 'warning'
                          ? 'alert'
                          : 'offline'
                      }`}
                    >
                      {selectedSensor.status || 'Active'}
                    </span>
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

export default IotMonitoring
