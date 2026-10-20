import React, { createContext, useContext, useState, useEffect } from 'react'

// No built-in PINs: on first run the owner creates their own via the setup screen.
function loadUsers() {
  try {
    const saved = localStorage.getItem('pos_users')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* corrupt storage — treat as first run */ }
  return []
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(loadUsers)

  useEffect(() => {
    try {
      localStorage.setItem('pos_users', JSON.stringify(users))
    } catch { /* storage full or unavailable */ }
  }, [users])

  function login(pin) {
    const trimmed = pin.trim()
    const user = users.find(u => u.pin === trimmed)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false }
  }

  function setupUsers(ownerPin, cashierPin) {
    const owner = { id: 'owner', name: 'Owner', role: 'owner', pin: ownerPin }
    const cashier = { id: 'cashier', name: 'Cashier', role: 'cashier', pin: cashierPin }
    setUsers([owner, cashier])
    setCurrentUser(owner)
  }

  function logout() {
    setCurrentUser(null)
  }

  function updatePin(userId, newPin) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pin: newPin } : u))
  }

  function updateName(userId, newName) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, name: newName } : u))
  }

  const isOwner   = currentUser?.role === 'owner'
  const isCashier = currentUser?.role === 'cashier'

  return (
    <AuthContext.Provider value={{ currentUser, users, needsSetup: users.length === 0, setupUsers, login, logout, updatePin, updateName, isOwner, isCashier }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
