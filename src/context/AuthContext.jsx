import React, { createContext, useContext, useState } from 'react'

// Hardcoded — no localStorage involved at all
const USERS = [
  { id: 'owner',   name: 'Owner',   role: 'owner',   pin: '1234' },
  { id: 'cashier', name: 'Cashier', role: 'cashier', pin: '0000' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(USERS)

  function login(pin) {
    const trimmed = pin.trim()
    const user = users.find(u => u.pin === trimmed)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false }
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
    <AuthContext.Provider value={{ currentUser, users, login, logout, updatePin, updateName, isOwner, isCashier }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
