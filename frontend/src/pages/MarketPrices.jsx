import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import './MarketPrices.css'

function MarketPrices() {
  const [prices, setPrices] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)

  // Form Fields
  const [commodityName, setCommodityName] = useState('')
  const [mandiName, setMandiName] = useState('')
  const [state, setState] = useState('Maharashtra')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [modalPrice, setModalPrice] = useState('')
  const [priceTrend, setPriceTrend] = useState('+1.5%')
  const [priceDate, setPriceDate] = useState('')

  const [editId, setEditId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // =========================
  // LOAD MARKET PRICES
  // =========================
  const loadPrices = async () => {
    try {
      setLoadingList(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await api.get('/api/market-prices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('MARKET PRICES:', response.data)
      setPrices(response.data)
    } catch (err) {
      console.error('GET MARKET PRICES ERROR:', err)
      if (err.response) {
        setError(`Failed to load market prices (Server: ${err.response.status})`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadPrices()
  }, [])

  // =========================
  // ADD MARKET PRICE
  // =========================
  const handleAddPrice = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.post(
        '/market/create',
        {
          commodityName: commodityName,
          mandiName: mandiName,
          state: state,
          minPrice: parseFloat(minPrice) || 0,
          maxPrice: parseFloat(maxPrice) || 0,
          modalPrice: parseFloat(modalPrice) || 0,
          priceTrend: priceTrend,
          priceDate: priceDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('PRICE ADDED:', response.data)
      alert('Mandi market price added successfully!')

      closeAddModal()
      loadPrices()
    } catch (err) {
      console.error('ADD MARKET PRICE ERROR:', err)
      if (err.response) {
        setError(`Failed to add: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
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

      const response = await api.get(`/market/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('VIEW PRICE DATA:', response.data)
      setSelectedItem(response.data)
    } catch (err) {
      console.error('VIEW MARKET PRICE ERROR:', err)
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
    setCommodityName(item.commodityName || '')
    setMandiName(item.mandiName || '')
    setState(item.state || 'Maharashtra')
    setMinPrice(item.minPrice !== undefined ? String(item.minPrice) : '')
    setMaxPrice(item.maxPrice !== undefined ? String(item.maxPrice) : '')
    setModalPrice(item.modalPrice !== undefined ? String(item.modalPrice) : '')
    setPriceTrend(item.priceTrend || '+0.0%')
    setPriceDate(item.priceDate || '')
    setError('')
    setShowEditModal(true)
  }

  // =========================
  // UPDATE PRICE
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await api.put(
        `/market/update/${editId}`,
        {
          commodityName: commodityName,
          mandiName: mandiName,
          state: state,
          minPrice: parseFloat(minPrice) || 0,
          maxPrice: parseFloat(maxPrice) || 0,
          modalPrice: parseFloat(modalPrice) || 0,
          priceTrend: priceTrend,
          priceDate: priceDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('PRICE UPDATED:', response.data)
      alert('Mandi rate updated successfully!')

      closeEditModal()
      loadPrices()
    } catch (err) {
      console.error('UPDATE MARKET PRICE ERROR:', err)
      if (err.response) {
        setError(`Failed to update: ${JSON.stringify(err.response.data)}`)
      } else {
        setError('Cannot connect to backend.')
      }
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DELETE PRICE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this mandi price record?')
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')

      await api.delete(`/market/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert('Mandi price removed successfully!')
      loadPrices()
    } catch (err) {
      console.error('DELETE MARKET PRICE ERROR:', err)
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
    setCommodityName('')
    setMandiName('')
    setState('Maharashtra')
    setMinPrice('')
    setMaxPrice('')
    setModalPrice('')
    setPriceTrend('+1.5%')
    setPriceDate('')
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditId(null)
    setCommodityName('')
    setMandiName('')
    setState('Maharashtra')
    setMinPrice('')
    setMaxPrice('')
    setModalPrice('')
    setPriceTrend('+1.5%')
    setPriceDate('')
    setError('')
  }

  const closeView = () => {
    setShowViewModal(false)
    setSelectedItem(null)
    setError('')
  }

  // Search filter
  const filteredPrices = prices.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      (item.commodityName && item.commodityName.toLowerCase().includes(term)) ||
      (item.mandiName && item.mandiName.toLowerCase().includes(term)) ||
      (item.state && item.state.toLowerCase().includes(term))
    )
  })

  // Quick ticker commodities
  const wheatRate = prices.find((p) => p.commodityName?.toLowerCase().includes('wheat'))
  const riceRate = prices.find((p) => p.commodityName?.toLowerCase().includes('rice'))
  const cottonRate = prices.find((p) => p.commodityName?.toLowerCase().includes('cotton'))
  const soybeanRate = prices.find((p) => p.commodityName?.toLowerCase().includes('soybean'))

  return (
    <Layout>
      <div className="market-page">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="market-header">
          <div>
            <h1>APMC & Mandi Market Prices</h1>
            <p>Live agricultural commodity rates, wholesale market prices, and mandi trends across India.</p>
          </div>

          <button
            className="add-price-btn"
            onClick={() => {
              setError('')
              setShowAddModal(true)
            }}
          >
            <span>+</span> Record Mandi Price
          </button>
        </div>

        {/* =========================
            COMMODITY TICKERS
        ========================= */}
        <div className="market-summary">
          <div className="market-summary-card">
            <span>Wheat (Per Qtl)</span>
            <h2>₹{wheatRate ? wheatRate.modalPrice.toLocaleString() : '2,150'}</h2>
            <p>
              {wheatRate?.mandiName || 'Nashik Mandi'} •{' '}
              <strong style={{ color: '#16a34a' }}>{wheatRate?.priceTrend || '+2.4%'}</strong>
            </p>
          </div>

          <div className="market-summary-card">
            <span>Basmati Rice (Per Qtl)</span>
            <h2>₹{riceRate ? riceRate.modalPrice.toLocaleString() : '3,850'}</h2>
            <p>
              {riceRate?.mandiName || 'Karnal APMC'} •{' '}
              <strong style={{ color: '#16a34a' }}>{riceRate?.priceTrend || '+1.8%'}</strong>
            </p>
          </div>

          <div className="market-summary-card">
            <span>Cotton (Per Qtl)</span>
            <h2>₹{cottonRate ? cottonRate.modalPrice.toLocaleString() : '6,800'}</h2>
            <p>
              {cottonRate?.mandiName || 'Rajkot Mandi'} •{' '}
              <strong style={{ color: '#dc2626' }}>{cottonRate?.priceTrend || '-0.8%'}</strong>
            </p>
          </div>

          <div className="market-summary-card">
            <span>Soybean (Per Qtl)</span>
            <h2>₹{soybeanRate ? soybeanRate.modalPrice.toLocaleString() : '4,650'}</h2>
            <p>
              {soybeanRate?.mandiName || 'Indore APMC'} •{' '}
              <strong style={{ color: '#16a34a' }}>{soybeanRate?.priceTrend || '+3.2%'}</strong>
            </p>
          </div>
        </div>

        {/* =========================
            PRICE LIST PANEL
        ========================= */}
        <div className="market-panel">
          <div className="market-panel-header">
            <div>
              <h2>Commodity Mandi Price Board</h2>
              <p>Minimum, maximum, and average modal trading rates per quintal.</p>
            </div>

            <div className="market-search">
              🔍
              <input
                type="text"
                placeholder="Search commodity, mandi, state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="market-table">
            <div className="market-table-header">
              <span>Commodity</span>
              <span>Mandi / APMC</span>
              <span>State</span>
              <span>Min - Max (₹)</span>
              <span>Modal Price (₹/Qtl)</span>
              <span>Daily Trend</span>
              <span>Actions</span>
            </div>

            {loadingList && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                Fetching live APMC market data...
              </div>
            )}

            {!loadingList && error && !showAddModal && !showEditModal && !showViewModal && (
              <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2' }}>
                {error}
              </div>
            )}

            {!loadingList && !error && filteredPrices.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#78837d' }}>
                {prices.length === 0
                  ? 'No mandi rates recorded yet. Click "+ Record Mandi Price" to add one!'
                  : 'No market prices matched your search.'}
              </div>
            )}

            {!loadingList &&
              filteredPrices.map((item) => (
                <div className="market-table-row" key={item.id}>
                  <div>
                    <strong>{item.commodityName}</strong>
                    <small>Dated: {item.priceDate || 'Today'}</small>
                  </div>

                  <span>
                    <strong>{item.mandiName}</strong>
                  </span>

                  <span>{item.state}</span>

                  <span>
                    ₹{item.minPrice} - ₹{item.maxPrice}
                  </span>

                  <span>
                    <strong style={{ fontSize: '14px', color: '#059669' }}>
                      ₹{item.modalPrice.toLocaleString()}
                    </strong>
                    <small> / Quintal</small>
                  </span>

                  <span>
                    <span
                      className={`trend-badge ${
                        item.priceTrend?.startsWith('+')
                          ? 'positive'
                          : item.priceTrend?.startsWith('-')
                          ? 'negative'
                          : 'neutral'
                      }`}
                    >
                      {item.priceTrend || '+0.0%'}
                    </span>
                  </span>

                  <div className="market-actions">
                    <button
                      title="View Price Dossier"
                      onClick={() => handleView(item.id)}
                    >
                      👁
                    </button>

                    <button
                      title="Edit Price"
                      onClick={() => openEdit(item)}
                    >
                      ✏️
                    </button>

                    <button
                      title="Delete Price"
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
                  <h2>Record Mandi Price</h2>
                  <p>Add wholesale mandi trading rates for a commodity.</p>
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

              <form onSubmit={handleAddPrice}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>Commodity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wheat, Basmati Rice, Cotton"
                      value={commodityName}
                      onChange={(e) => setCommodityName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Mandi / APMC Market</label>
                    <input
                      type="text"
                      placeholder="e.g. Nashik Mandi, Pune APMC"
                      value={mandiName}
                      onChange={(e) => setMandiName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>State</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Daily Trend (% change)</label>
                    <input
                      type="text"
                      placeholder="e.g. +2.4% or -1.1%"
                      value={priceTrend}
                      onChange={(e) => setPriceTrend(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="crop-form-group">
                    <label>Min (₹)</label>
                    <input
                      type="number"
                      placeholder="2050"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Max (₹)</label>
                    <input
                      type="number"
                      placeholder="2250"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Modal (₹)</label>
                    <input
                      type="number"
                      placeholder="2150"
                      value={modalPrice}
                      onChange={(e) => setModalPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Price Date</label>
                  <input
                    type="date"
                    value={priceDate}
                    onChange={(e) => setPriceDate(e.target.value)}
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
                    style={{ background: '#059669' }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Mandi Rate'}
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
                  <h2>Edit Mandi Rate</h2>
                  <p>Update commodity trading prices.</p>
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
                    <label>Commodity Name</label>
                    <input
                      type="text"
                      value={commodityName}
                      onChange={(e) => setCommodityName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Mandi / APMC Market</label>
                    <input
                      type="text"
                      value={mandiName}
                      onChange={(e) => setMandiName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="crop-form-group">
                    <label>State</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                  </div>

                  <div className="crop-form-group">
                    <label>Daily Trend (% change)</label>
                    <input
                      type="text"
                      value={priceTrend}
                      onChange={(e) => setPriceTrend(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="crop-form-group">
                    <label>Min (₹)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Max (₹)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="crop-form-group">
                    <label>Modal (₹)</label>
                    <input
                      type="number"
                      value={modalPrice}
                      onChange={(e) => setModalPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crop-form-group">
                  <label>Price Date</label>
                  <input
                    type="date"
                    value={priceDate}
                    onChange={(e) => setPriceDate(e.target.value)}
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
                    style={{ background: '#059669' }}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Mandi Rate'}
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
                  <h2>Mandi Price Analysis</h2>
                  <p>Market rate dossier for {selectedItem?.commodityName}</p>
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
                  Loading market price report...
                </div>
              ) : selectedItem ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Commodity
                      </span>
                      <p style={{ fontSize: '16px', color: '#20372a', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.commodityName}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Mandi Location
                      </span>
                      <p style={{ fontSize: '15px', color: '#059669', fontWeight: '700', margin: '4px 0 0' }}>
                        {selectedItem.mandiName} ({selectedItem.state})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f7f9f8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Min Price
                      </span>
                      <p style={{ fontSize: '16px', color: '#20372a', fontWeight: '700', margin: '4px 0 0' }}>
                        ₹{selectedItem.minPrice}
                      </p>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                        Modal Price
                      </span>
                      <p style={{ fontSize: '18px', color: '#059669', fontWeight: '800', margin: '4px 0 0' }}>
                        ₹{selectedItem.modalPrice.toLocaleString()}
                      </p>
                    </div>

                    <div style={{ background: '#f7f9f8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #edf0ee' }}>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Max Price
                      </span>
                      <p style={{ fontSize: '16px', color: '#20372a', fontWeight: '700', margin: '4px 0 0' }}>
                        ₹{selectedItem.maxPrice}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#f7f9f8', padding: '12px 16px', borderRadius: '8px', border: '1px solid #edf0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase' }}>
                        Market Date
                      </span>
                      <p style={{ fontSize: '14px', color: '#20372a', fontWeight: '600', margin: '3px 0 0' }}>
                        {selectedItem.priceDate}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#737e78', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        Daily Trend
                      </span>
                      <span
                        className={`trend-badge ${
                          selectedItem.priceTrend?.startsWith('+')
                            ? 'positive'
                            : selectedItem.priceTrend?.startsWith('-')
                            ? 'negative'
                            : 'neutral'
                        }`}
                      >
                        {selectedItem.priceTrend}
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

export default MarketPrices
