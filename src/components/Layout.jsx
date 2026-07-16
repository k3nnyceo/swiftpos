import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'

function Clock() {
  const [time, setTime] = React.useState(new Date())
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="text-sm text-gray-400">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

export default function Layout() {
  const { state, lowStockItems, outOfStockItems } = usePOS()
  const { currentUser, logout, isOwner } = useAuth()
  const alertCount = lowStockItems.length + outOfStockItems.length

  // Nav items — owner sees everything, cashier only sees Sales
  const NAV = [
    { to: '/sales',     icon: '🛒', label: 'Sales',     always: true  },
    { to: '/inventory', icon: '📦', label: 'Inventory', ownerOnly: true },
    { to: '/reports',   icon: '📊', label: 'Reports',   ownerOnly: true },
    { to: '/settings',  icon: '⚙️',  label: 'Settings',  ownerOnly: true },
  ].filter(n => n.always || isOwner)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 bg-[#1a1f2e] flex flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="w-10 h-10 bg-[#e8622a] rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">SP</span>
        </div>

        {NAV.map(({ to, icon, label, ownerOnly }) => (
          <NavLink key={to} to={to} title={label}
            className={({ isActive }) =>
              `relative w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all
              ${isActive ? 'bg-[#e8622a] text-white' : 'text-gray-500 hover:bg-[#252c3f] hover:text-white'}`
            }>
            {icon}
            {to === '/inventory' && alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}

        {/* Logout at the bottom */}
        <div className="mt-auto">
          <button onClick={logout} title="Lock / switch user"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl text-gray-500 hover:bg-[#252c3f] hover:text-white transition-all">
            🔒
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-800 text-sm">{state.store.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
              {state.store.type}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            {/* Role badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${isOwner ? 'bg-[#e8622a]/10 text-[#e8622a]' : 'bg-blue-50 text-blue-600'}`}>
              {isOwner ? '👑 Owner' : '🧑‍💼 Cashier'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#e8622a]/10 flex items-center justify-center text-xs font-semibold text-[#e8622a]">
                {currentUser?.name?.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
