import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const [farms, setFarms] = useState([])
  const [loadingFarms, setLoadingFarms] = useState(true)
  const [error, setError] = useState('')
  const loadDashboardData = async () => {
    try {
      setLoadingFarms(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/farmer/getAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('DASHBOARD FARMS:', response.data)
      setFarms(response.data)
    } catch (err) {
      console.error('DASHBOARD DATA ERROR:', err)
      if (err.response) {
        setError(`Failed to load data (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingFarms(false)
    }
  }

  // Load farms when Dashboard opens
  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <Layout>

      {/* Dashboard Content */}
      <section className="dashboard-content">

        {/* Dynamic Role-Aware Heading */}
        <div className="dashboard-heading">

          <div>
            <h1>
              {localStorage.getItem('activeRole') === 'Admin'
                ? '⚡ System Administrator Dashboard'
                : localStorage.getItem('activeRole') === 'Field Officer'
                ? '📋 Field Officer Operations Dashboard'
                : localStorage.getItem('activeRole') === 'Agricultural Officer'
                ? '🔬 Agricultural Officer Advisory Dashboard'
                : localStorage.getItem('activeRole') === 'Guest'
                ? '👤 Guest Agriculture Portal'
                : '🌾 Farmer Dashboard'}
            </h1>

            <p>
              {localStorage.getItem('activeRole') === 'Admin'
                ? 'Complete platform health, security access control, and multi-tenant farm oversight.'
                : localStorage.getItem('activeRole') === 'Field Officer'
                ? 'Field inspection status, sensor anomalies, and operational ground monitoring.'
                : localStorage.getItem('activeRole') === 'Agricultural Officer'
                ? 'Regional crop variety planning, precision nutrition, and yield benchmarking.'
                : localStorage.getItem('activeRole') === 'Guest'
                ? 'Public Mandi commodity market prices and regional agricultural weather overview.'
                : "Good morning! Here's your farm overview and operational status for today."}
            </p>
          </div>

          <div className="heading-actions">
            <button
              className="refresh-button"
              onClick={loadDashboardData}
              title="Reload dashboard data"
            >
              ↻ Refresh
            </button>

            <button
              className="add-farm-button"
              onClick={() => navigate('/farm-management')}
            >
              + Add Farm
            </button>
          </div>

        </div>


        {/* Weather Card */}
        <div className="weather-card">

          <div className="weather-main">
            <span className="weather-icon">☀️</span>

            <div>
              <h2>29°C</h2>
              <p>Clear & Sunny</p>
            </div>
          </div>

          <div className="weather-info">
            <span>💨 18 km/h</span>
            <span>💧 62% Humidity</span>
            <span>☀️ Sunny</span>
          </div>

          <div className="weather-status">
            <strong>No Rain Expected</strong>
            <span>Next 48 hours clear</span>
          </div>

        </div>


        {/* Statistics Cards */}
        <div className="stats-grid">

          {/* DYNAMIC TOTAL FARMS */}
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Farms</span>
              <div className="stat-icon">🌾</div>
            </div>

            <h2>{loadingFarms ? '...' : farms.length}</h2>
            <p>{farms.length} registered {farms.length === 1 ? 'farm' : 'farms'}</p>
            <small>↑ Live from database</small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>Active Crops</span>
              <div className="stat-icon">🌱</div>
            </div>

            <h2>3</h2>
            <p>Wheat, Rice, Corn</p>
            <small>↑ On schedule vs last month</small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>Avg Soil Moisture</span>
              <div className="stat-icon">💧</div>
            </div>

            <h2>68%</h2>
            <p>Across all farms</p>
            <small>↑ 3% today vs last month</small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>Avg Health Score</span>
              <div className="stat-icon">📈</div>
            </div>

            <h2>92/100</h2>
            <p>Farm health average</p>
            <small>↑ 2 pts vs last month</small>
          </div>

        </div>


        {/* Activity Cards */}
        <div className="activity-grid">

          <div className="activity-card">
            <span className="activity-icon">💧</span>

            <div>
              <p>Today's Irrigation</p>
              <h3>Active</h3>
              <small>East Block - 2.3K L</small>
            </div>
          </div>


          <div className="activity-card">
            <span className="activity-icon">🧪</span>

            <div>
              <p>Fertilizer Due</p>
              <h3>Today</h3>
              <small>North Field - Wheat</small>
            </div>
          </div>


          <div className="activity-card">
            <span className="activity-icon warning">🐛</span>

            <div>
              <p>Pest Alert</p>
              <h3>Alert</h3>
              <small>South Field - Block A</small>
            </div>
          </div>


          <div className="activity-card">
            <span className="activity-icon">💰</span>

            <div>
              <p>Wheat Price</p>
              <h3>₹2,150</h3>
              <small>+2.4% today at local market</small>
            </div>
          </div>

        </div>


        {/* Bottom Section */}
        <div className="bottom-grid">

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Farm Overview</h2>
                <p>Your farms and current status</p>
              </div>

              <button onClick={() => navigate('/farm-management')}>
                View All
              </button>

            </div>


            <div className="farm-list">

              {loadingFarms ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#78837d',
                    fontSize: '12px',
                  }}
                >
                  Loading farm overview...
                </div>
              ) : error ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: '#dc2626',
                    fontSize: '12px',
                  }}
                >
                  {error}
                </div>
              ) : farms.length === 0 ? (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#78837d',
                    fontSize: '12px',
                  }}
                >
                  No registered farms found. Click "+ Add Farm" to create one!
                </div>
              ) : (
                farms.map((farm) => (
                  <div className="farm-row" key={farm.id}>
                    <div>
                      <strong>{farm.farmName}</strong>
                      <span>
                        {farm.location ? `${farm.location} • ` : ''}Farmer: {farm.farmerName}
                      </span>
                    </div>

                    <span className="status active-status">
                      Active
                    </span>
                  </div>
                ))
              )}

            </div>

          </div>


          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>Farm Health</h2>
                <p>Overall farm performance</p>
              </div>

            </div>


            <div className="health-score">

              <div className="score-circle">
                <strong>92</strong>
                <span>/100</span>
              </div>

              <div>
                <h3>Excellent</h3>
                <p>Your farms are performing well.</p>
              </div>

            </div>


            <div className="health-bar">
              <div></div>
            </div>

          </div>

        </div>

      </section>

    </Layout>
  )
}

export default Dashboard