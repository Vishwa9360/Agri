import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './Analytics.css'

const DEFAULT_YIELD = {
  farmName: 'Green Valley Farm',
  location: 'Nashik, Maharashtra',
  totalActualYieldKg: 14500,
  totalTargetYieldKg: 16000,
  yieldEfficiencyPercent: 90.6,
  cropBreakdown: [
    { cropName: 'Wheat', variety: 'HD-2967 (Cereal)', season: 'Rabi', areaAcres: 6.0, actualYieldKg: 7200, targetYieldKg: 7800, efficiencyPercent: 92.3 },
    { cropName: 'Soybean', variety: 'JS-335 (Legume)', season: 'Kharif', areaAcres: 5.0, actualYieldKg: 4800, targetYieldKg: 5200, efficiencyPercent: 92.3 },
    { cropName: 'Cotton', variety: 'BT-Cotton (Fiber)', season: 'Kharif', areaAcres: 4.0, actualYieldKg: 2500, targetYieldKg: 3000, efficiencyPercent: 83.3 },
  ],
}

const DEFAULT_COST = {
  totalInputCost: 295000,
  averageCostPerAcre: 19666,
  costBreakdown: [
    { category: 'Fertilizers & Nutrients', amount: 85000, percentage: 28.8, color: '#10b981' },
    { category: 'Labor & Machinery', amount: 75000, percentage: 25.4, color: '#3b82f6' },
    { category: 'Irrigation & Power', amount: 55000, percentage: 18.6, color: '#06b6d4' },
    { category: 'Seeds & Saplings', amount: 45000, percentage: 15.3, color: '#f59e0b' },
    { category: 'Pest & Crop Protection', amount: 35000, percentage: 11.9, color: '#ef4444' },
  ],
}

const DEFAULT_PROFIT = {
  grossRevenue: 785000,
  totalCost: 295000,
  netProfit: 490000,
  profitMarginPercent: 62.4,
  roiPercent: 166.1,
  cropProfitability: [
    { cropName: 'Wheat', revenue: 325000, cost: 115000, netProfit: 210000, margin: 64.6 },
    { cropName: 'Soybean', revenue: 260000, cost: 98000, netProfit: 162000, margin: 62.3 },
    { cropName: 'Cotton', revenue: 200000, cost: 82000, netProfit: 118000, margin: 59.0 },
  ],
}

const DEFAULT_WEATHER = {
  location: 'Nashik, Maharashtra',
  temperatureC: 28.5,
  condition: 'Partly Cloudy',
  humidityPercent: 68.0,
  windSpeedKmh: 14.2,
  advisory: 'Favorable weather for morning spraying and light irrigation. No heavy rainfall expected in next 48 hours.',
}

function Analytics() {
  const [farms, setFarms] = useState([])
  const [selectedFarmId, setSelectedFarmId] = useState(1)
  const [yieldData, setYieldData] = useState(DEFAULT_YIELD)
  const [costData, setCostData] = useState(DEFAULT_COST)
  const [profitData, setProfitData] = useState(DEFAULT_PROFIT)
  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER)
  const [insightsData, setInsightsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [waterUnit, setWaterUnit] = useState('m3')
  const [waterTimeframe, setWaterTimeframe] = useState('7d')

  
  const fetchFarms = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get('/farmer/getAll', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data && res.data.length > 0) {
        setFarms(res.data)
        setSelectedFarmId(res.data[0].id)
      }
    } catch (err) {
      console.error('Failed to load farms:', err)
    }
  }

  const loadAnalytics = async (farmId) => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [resYield, resCost, resProfit, resWeather, resInsights] = await Promise.all([
        api.get(`/api/analytics/yield/${farmId || 1}`, { headers }).catch(() => null),
        api.get('/api/analytics/input-cost', { headers }).catch(() => null),
        api.get('/api/analytics/profitability', { headers }).catch(() => null),
        api.get(`/api/weather/${farmId || 1}`, { headers }).catch(() => null),
        api.get('/api/analytics/insights', { headers }).catch(() => null),
      ])

      if (resYield && resYield.data) setYieldData(resYield.data)
      if (resCost && resCost.data) setCostData(resCost.data)
      if (resProfit && resProfit.data) setProfitData(resProfit.data)
      if (resWeather && resWeather.data) setWeatherData(resWeather.data)
      if (resInsights && resInsights.data) setInsightsData(resInsights.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [])

  useEffect(() => {
    if (selectedFarmId) {
      loadAnalytics(selectedFarmId)
    }
  }, [selectedFarmId])

  // =========================
  // EXPORT CSV REPORT
  // =========================
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await api.get(`/api/analytics/export/yield/${selectedFarmId || 1}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Yield_Performance_Farm_${selectedFarmId || 1}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    } catch {
      console.warn('Falling back to client-side CSV generation')
    }

    const currentYield = yieldData || DEFAULT_YIELD
    const currentCost = costData || DEFAULT_COST
    const currentProfit = profitData || DEFAULT_PROFIT

    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'SMART FARMING MANAGEMENT SYSTEM - PERFORMANCE & PROFITABILITY REPORT\n'
    csvContent += `Farm Name: ${currentYield.farmName || 'Farm'}\n`
    csvContent += `Location: ${currentYield.location || 'Maharashtra'}\n`
    csvContent += `Generated On: ${new Date().toLocaleDateString()}\n\n`

    csvContent += 'CROP YIELD BREAKDOWN\n'
    csvContent += 'Crop Name,Variety,Season,Area (Acres),Actual Yield (kg),Target Yield (kg),Efficiency (%)\n'
    if (currentYield.cropBreakdown) {
      currentYield.cropBreakdown.forEach((c) => {
        csvContent += `"${c.cropName}","${c.variety}","${c.season || ''}",${c.areaAcres},${c.actualYieldKg},${c.targetYieldKg},${c.efficiencyPercent}%\n`
      })
    }
    csvContent += '\n'

    csvContent += 'INPUT COST BREAKDOWN\n'
    csvContent += 'Category,Amount (INR),Share (%)\n'
    if (currentCost.costBreakdown) {
      currentCost.costBreakdown.forEach((cat) => {
        csvContent += `"${cat.category}",₹${cat.amount},${cat.percentage}%\n`
      })
    }
    csvContent += `Total Input Cost,₹${currentCost.totalInputCost}\n\n`

    csvContent += 'PROFITABILITY SUMMARY\n'
    csvContent += `Gross Revenue,₹${currentProfit.grossRevenue}\n`
    csvContent += `Total Cost,₹${currentProfit.totalCost}\n`
    csvContent += `Net Profit,₹${currentProfit.netProfit}\n`
    csvContent += `Profit Margin,${currentProfit.profitMarginPercent}%\n`
    csvContent += `Return On Investment (ROI),${currentProfit.roiPercent}%\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Farm_Analytics_Report_${selectedFarmId || 1}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="analytics-container">

        {/* Page Header */}
        <div className="analytics-header">
          <div className="analytics-title">
            <h1>📊 Farm Analytics & Yield Reports</h1>
            <p>Operational KPI tracking, crop yield benchmarking, input cost distribution, and profitability analysis.</p>
          </div>

          <div className="analytics-actions">
            {farms.length > 0 && (
              <select
                className="farm-select-dropdown"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    🏡 {f.farmName} ({f.farmerName})
                  </option>
                ))}
              </select>
            )}

            <button className="export-btn" onClick={handleExportCSV}>
              📥 Export CSV Report
            </button>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

        {/* Weather Advisory */}
        {weatherData && (
          <div className="weather-advisory-card">
            <div className="weather-icon-box">⛅</div>
            <div className="weather-info">
              <h4>Field Advisory & Weather Forecast: {weatherData.location} ({weatherData.temperatureC}°C, {weatherData.condition})</h4>
              <p>{weatherData.advisory} Humidity: {weatherData.humidityPercent}%, Wind: {weatherData.windSpeedKmh} km/h.</p>
            </div>
          </div>
        )}

        {/* AI Weekly Agronomic Natural Language Summary (SRS Section 11 & Step 3-J) */}
        {insightsData && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px 22px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <h3 style={{ fontSize: '16px', color: '#166534', margin: 0, fontWeight: '700' }}>
                  AI Weekly Agronomic Executive Intelligence
                </h3>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', border: '1px solid #86efac' }}>
                {insightsData.overallHealthStatus || 'STATUS: OPTIMAL BIOMASS'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: 'white', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '700', color: '#047857', marginBottom: '4px' }}>💧 Soil Moisture & Irrigation</div>
                <div style={{ color: '#374151', lineHeight: '1.4' }}>{insightsData.soilMoistureSummary}</div>
              </div>

              <div style={{ background: 'white', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '700', color: '#047857', marginBottom: '4px' }}>🌱 Nutrient Telemetry</div>
                <div style={{ color: '#374151', lineHeight: '1.4' }}>{insightsData.nutrientStatus}</div>
              </div>

              <div style={{ background: 'white', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '700', color: '#047857', marginBottom: '4px' }}>🛡️ Pest & Pathogen Surveillance</div>
                <div style={{ color: '#374151', lineHeight: '1.4' }}>{insightsData.pestAdvisory}</div>
              </div>

              <div style={{ background: 'white', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: '700', color: '#047857', marginBottom: '4px' }}>📈 APMC Market Selling Window</div>
                <div style={{ color: '#374151', lineHeight: '1.4' }}>{insightsData.marketRecommendation}</div>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================
            WATER CONSERVATION ANALYTICS & PRECISION EFFICIENCY (SRS)
        ======================================================== */}
        <div className="water-analytics-section" style={{ background: 'white', borderRadius: '12px', border: '1px solid #bbf7d0', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(16,185,129,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #f0fdf4', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💧</span>
                <div>
                  <h2 style={{ fontSize: '18px', color: '#166534', margin: 0, fontWeight: '700' }}>
                    Water Conservation Analytics & Precision Drip Efficiency
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#4b5563', margin: '4px 0 0 0' }}>
                    Quantitative accounting of agricultural freshwater conserved, pump energy mitigation, and carbon offsets.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', background: '#f0fdf4', borderRadius: '6px', padding: '3px', border: '1px solid #bbf7d0' }}>
                <button
                  type="button"
                  onClick={() => setWaterUnit('m3')}
                  style={{
                    border: 'none',
                    background: waterUnit === 'm3' ? '#16a34a' : 'transparent',
                    color: waterUnit === 'm3' ? 'white' : '#15803d',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cubic Meters (m³)
                </button>
                <button
                  type="button"
                  onClick={() => setWaterUnit('liters')}
                  style={{
                    border: 'none',
                    background: waterUnit === 'liters' ? '#16a34a' : 'transparent',
                    color: waterUnit === 'liters' ? 'white' : '#15803d',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Liters (L)
                </button>
              </div>

              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px' }}>
                {['7d', '30d'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWaterTimeframe(t)}
                    style={{
                      border: 'none',
                      background: waterTimeframe === t ? '#0f172a' : 'transparent',
                      color: waterTimeframe === t ? 'white' : '#64748b',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Conservation Metric Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: '600' }}>Cumulative Water Saved</span>
              <h3 style={{ fontSize: '24px', color: '#166534', margin: '6px 0 2px 0', fontWeight: '800' }}>
                {waterUnit === 'm3' ? '53.0 m³' : '53,000 L'}
              </h3>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>+38.4% Efficiency Gain</span>
            </div>

            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: '600' }}>Pump Power Conserved</span>
              <h3 style={{ fontSize: '24px', color: '#1d4ed8', margin: '6px 0 2px 0', fontWeight: '800' }}>
                95.4 kWh
              </h3>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600' }}>@ 1.8 kWh / m³ saved</span>
            </div>

            <div style={{ background: '#faf5ff', padding: '16px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '11.5px', color: '#6b21a8', fontWeight: '600' }}>Carbon Footprint Offset</span>
              <h3 style={{ fontSize: '24px', color: '#7e22ce', margin: '6px 0 2px 0', fontWeight: '800' }}>
                47.7 kg CO₂
              </h3>
              <span style={{ fontSize: '11px', color: '#9333ea', fontWeight: '600' }}>Mitigated Greenhouse Gases</span>
            </div>

            <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '11.5px', color: '#92400e', fontWeight: '600' }}>Water-Use Efficiency (WUE)</span>
              <h3 style={{ fontSize: '24px', color: '#b45309', margin: '6px 0 2px 0', fontWeight: '800' }}>
                94.6%
              </h3>
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>vs 58.0% Traditional Flood</span>
            </div>
          </div>

          {/* Graphical Visualizations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* Chart 1: Traditional Flood vs Precision Drip Comparison */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                  📊 Daily Water Volume: Traditional vs Precision Drip
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Last 7 Days</span>
              </div>

              <div style={{ display: 'flex', gap: '15px', fontSize: '11px', marginBottom: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: '600' }}>■ Traditional Flood (L)</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>■ AgroSense Precision Drip (L)</span>
                <span style={{ color: '#0284c7', fontWeight: '600' }}>■ Net Savings</span>
              </div>

              <svg viewBox="0 0 460 210" style={{ width: '100%', height: 'auto', background: 'white', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                {/* Horizontal Grid */}
                {[30, 70, 110, 150].map((y, idx) => (
                  <line key={idx} x1="40" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                <text x="35" y="34" font-size="8.5" fill="#94a3b8" textAnchor="end">1600L</text>
                <text x="35" y="74" font-size="8.5" fill="#94a3b8" textAnchor="end">1200L</text>
                <text x="35" y="114" font-size="8.5" fill="#94a3b8" textAnchor="end">800L</text>
                <text x="35" y="154" font-size="8.5" fill="#94a3b8" textAnchor="end">400L</text>

                {/* Day Columns */}
                {[
                  { d: 'Mon', flood: 1350, drip: 520 },
                  { d: 'Tue', flood: 1500, drip: 580 },
                  { d: 'Wed', flood: 1200, drip: 460 },
                  { d: 'Thu', flood: 1600, drip: 620 },
                  { d: 'Fri', flood: 1400, drip: 540 },
                  { d: 'Sat', flood: 1450, drip: 560 },
                  { d: 'Sun', flood: 1550, drip: 600 }
                ].map((item, idx) => {
                  const x = 55 + idx * 56;
                  const floodH = (item.flood / 1600) * 130;
                  const dripH = (item.drip / 1600) * 130;
                  return (
                    <g key={idx}>
                      {/* Flood Bar */}
                      <rect x={x} y={160 - floodH} width="16" height={floodH} rx="2" fill="#fca5a5" />
                      {/* Drip Bar */}
                      <rect x={x + 18} y={160 - dripH} width="16" height={dripH} rx="2" fill="#10b981" />
                      {/* X Label */}
                      <text x={x + 17} y="178" font-size="9" fill="#64748b" textAnchor="middle">{item.d}</text>
                      {/* Savings % */}
                      <text x={x + 17} y={155 - floodH} font-size="8" font-weight="bold" fill="#059669" textAnchor="middle">
                        -{Math.round(((item.flood - item.drip) / item.flood) * 100)}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                💡 Automated threshold gating prevents an average of <strong>910 Liters</strong> of deep water loss per cycle.
              </p>
            </div>

            {/* Chart 2: Cumulative Water Conserved by Parcel */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                  🌱 Parcel Water Savings Breakdown
                </strong>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                  Total: 53.0 m³
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { name: 'North Block Plot A1 (Maize)', saved: 14.8, pct: 39.2, color: '#10b981' },
                  { name: 'South Block Plot B2 (Cotton)', saved: 18.4, pct: 41.5, color: '#0284c7' },
                  { name: 'East Block Plot C1 (Wheat)', saved: 11.2, pct: 36.8, color: '#f59e0b' },
                  { name: 'Greenhouse Sector 4 (Tomatoes)', saved: 8.6, pct: 44.0, color: '#8b5cf6' }
                ].map((parcel, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{parcel.name}</span>
                      <span style={{ fontWeight: 'bold', color: parcel.color }}>
                        {waterUnit === 'm3' ? `${parcel.saved} m³` : `${parcel.saved * 1000} L`} (-{parcel.pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${(parcel.saved / 20.0) * 100}%`, height: '100%', background: parcel.color, borderRadius: '5px' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#475569' }}>
                  Want to actuate precision drip for another parcel?
                </span>
                <a href="/irrigation" style={{ background: '#16a34a', color: 'white', textDecoration: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '11.5px', fontWeight: '600' }}>
                  Schedule Cycle →
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper green">🌾</div>
            <div className="stat-meta">
              <div className="stat-label">Total Actual Yield</div>
              <div className="stat-value">
                {yieldData?.totalActualYieldKg ? yieldData.totalActualYieldKg.toLocaleString() : '14,500'} kg
              </div>
              <div className="stat-trend positive">
                Target: {yieldData?.totalTargetYieldKg?.toLocaleString() || '16,000'} kg ({yieldData?.yieldEfficiencyPercent || 90.6}%)
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper orange">💸</div>
            <div className="stat-meta">
              <div className="stat-label">Total Input Cost</div>
              <div className="stat-value">
                ₹{costData?.totalInputCost ? costData.totalInputCost.toLocaleString() : '2,95,000'}
              </div>
              <div className="stat-trend neutral">
                Avg. ₹{costData?.averageCostPerAcre?.toLocaleString() || '19,666'} / acre
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper blue">📈</div>
            <div className="stat-meta">
              <div className="stat-label">Gross Revenue</div>
              <div className="stat-value">
                ₹{profitData?.grossRevenue ? profitData.grossRevenue.toLocaleString() : '7,85,000'}
              </div>
              <div className="stat-trend positive">
                Net Profit: ₹{profitData?.netProfit?.toLocaleString() || '4,90,000'}
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="stat-icon-wrapper purple">💎</div>
            <div className="stat-meta">
              <div className="stat-label">ROI & Profit Margin</div>
              <div className="stat-value">
                {profitData?.profitMarginPercent || '62.4'}%
              </div>
              <div className="stat-trend positive">
                ROI: {profitData?.roiPercent || '166.1'}% Return
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard 2-Column Grid */}
        <div className="analytics-dashboard-grid">

          {/* Crop Yield Performance */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>🌱 Crop Season Yield Benchmarks</h3>
              <span className="badge-tag">Farm ID #{selectedFarmId}</span>
            </div>

            <div className="table-responsive">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Variety</th>
                    <th>Season</th>
                    <th>Acres</th>
                    <th>Actual Yield</th>
                    <th>Target Yield</th>
                    <th>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {yieldData?.cropBreakdown && yieldData.cropBreakdown.map((crop, idx) => (
                    <tr key={idx}>
                      <td><strong>{crop.cropName}</strong></td>
                      <td>{crop.variety}</td>
                      <td>{crop.season}</td>
                      <td>{crop.areaAcres} ac</td>
                      <td>{crop.actualYieldKg?.toLocaleString()} kg</td>
                      <td>{crop.targetYieldKg?.toLocaleString()} kg</td>
                      <td>
                        <span
                          className={`efficiency-badge ${
                            crop.efficiencyPercent >= 90
                              ? 'high'
                              : crop.efficiencyPercent >= 75
                              ? 'medium'
                              : 'low'
                          }`}
                        >
                          {crop.efficiencyPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Input Cost Breakdown */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>💰 Input Cost Allocation</h3>
              <span className="badge-tag">₹{costData?.totalInputCost?.toLocaleString()}</span>
            </div>

            <div className="cost-breakdown-list">
              {costData?.costBreakdown && costData.costBreakdown.map((cat, idx) => (
                <div key={idx} className="cost-item">
                  <div className="cost-item-header">
                    <span>{cat.category}</span>
                    <span>₹{cat.amount?.toLocaleString()} ({cat.percentage}%)</span>
                  </div>
                  <div className="cost-progress-bar">
                    <div
                      className="cost-progress-fill"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || '#10b981',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Crop-wise Profitability Table */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>💵 Crop Profitability Breakdown</h3>
            <span className="badge-tag">Net Revenue Performance</span>
          </div>

          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Revenue (INR)</th>
                  <th>Input Cost (INR)</th>
                  <th>Net Profit (INR)</th>
                  <th>Profit Margin</th>
                </tr>
              </thead>
              <tbody>
                {profitData?.cropProfitability && profitData.cropProfitability.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong>{p.cropName}</strong></td>
                    <td>₹{p.revenue?.toLocaleString()}</td>
                    <td style={{ color: '#ef4444' }}>- ₹{p.cost?.toLocaleString()}</td>
                    <td style={{ color: '#10b981', fontWeight: 'bold' }}>₹{p.netProfit?.toLocaleString()}</td>
                    <td>
                      <span className="efficiency-badge high">
                        {p.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export default Analytics
