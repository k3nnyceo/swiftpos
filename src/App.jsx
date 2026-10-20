import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SalesPage from './pages/SalesPage'
import InventoryPage from './pages/InventoryPage'
import DebtsPage from './pages/DebtsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { currentUser, isOwner } = useAuth()

  // Not logged in — always show login
  if (!currentUser) {
    return <LoginPage />
  }

  // Logged in — show the app
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/sales" replace />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="inventory" element={isOwner ? <InventoryPage /> : <Navigate to="/sales" replace />} />
        <Route path="debts"     element={isOwner ? <DebtsPage />     : <Navigate to="/sales" replace />} />
        <Route path="reports"   element={isOwner ? <ReportsPage />   : <Navigate to="/sales" replace />} />
        <Route path="settings"  element={isOwner ? <SettingsPage />  : <Navigate to="/sales" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
