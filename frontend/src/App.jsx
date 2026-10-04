import { Routes, Route, Navigate } from 'react-router-dom'
import FarmManagement from './pages/FarmManagement'
import CropPlanning from './pages/CropPlanning'
import IotMonitoring from './pages/IotMonitoring'
import Irrigation from './pages/Irrigation'
import Fertilizer from './pages/Fertilizer'
import PestDisease from './pages/PestDisease'
import DroneMonitoring from './pages/DroneMonitoring'
import MarketPrices from './pages/MarketPrices'
import Analytics from './pages/Analytics'
import AdminPanel from './pages/AdminPanel'
import Documents from './pages/Documents'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Operational & Farming Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farm"
        element={
          <ProtectedRoute>
            <FarmManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farm-management"
        element={
          <ProtectedRoute>
            <FarmManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crop-planning"
        element={
          <ProtectedRoute>
            <CropPlanning />
          </ProtectedRoute>
        }
      />

      <Route
        path="/iot-monitoring"
        element={
          <ProtectedRoute>
            <IotMonitoring />
          </ProtectedRoute>
        }
      />

      <Route
        path="/irrigation"
        element={
          <ProtectedRoute>
            <Irrigation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/fertilizer"
        element={
          <ProtectedRoute>
            <Fertilizer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pest-disease"
        element={
          <ProtectedRoute>
            <PestDisease />
          </ProtectedRoute>
        }
      />

      <Route
        path="/drone-monitoring"
        element={
          <ProtectedRoute>
            <DroneMonitoring />
          </ProtectedRoute>
        }
      />

      <Route
        path="/market-prices"
        element={
          <ProtectedRoute>
            <MarketPrices />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />

      {/* Role-Restricted Admin Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App