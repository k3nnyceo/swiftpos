import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { ShoppingCart, Package, ChartBar, Gear, LockKey, Crown, IdentificationCard, HandCoins } from '@phosphor-icons/react'
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
  const { state, lowStockItems, outOfStockItems, outstandingDebts } = usePOS()
  const { currentUser, logout, isOwner } = useAuth()
  const alertCount = lowStockItems.length + outOfStockItems.length

  // Nav items — owner sees everything, cashier only sees Sales
  const NAV = [
    { to: '/sales',     icon: ShoppingCart, label: 'Sales',     always: true  },
    { to: '/inventory', icon: Package,      label: 'Inventory', ownerOnly: true, badge: alertCount },
    { to: '/debts',     icon: HandCoins,    label: 'Debts',     ownerOnly: true, badge: outstandingDebts.length },
    { to: '/reports',   icon: ChartBar,     label: 'Reports',   ownerOnly: true },
    { to: '/settings',  icon: Gear,         label: 'Settings',  ownerOnly: true },
  ].filter(n => n.always || isOwner)

  return (
    <div className="flex h-[100dvh] bg-zinc-100 overflow-hidden">
      {/* Sidebar — desktop/tablet only */}
      <aside className="hidden md:flex w-16 bg-[#1a1f2e] flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="w-10 h-10 bg-[#ea580c] rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-sm">SP</span>
        </div>

        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} title={label}
            className={({ isActive }) =>
              `relative w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${isActive ? 'bg-[#ea580c] text-white' : 'text-gray-500 hover:bg-[#252c3f] hover:text-white'}`
            }>
            <Icon size={22} weight="bold" />
            {!!badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Logout at the bottom */}
        <div className="mt-auto">
          <button onClick={logout} title="Lock / switch user"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#252c3f] hover:text-white transition-all">
            <LockKey size={22} weight="bold" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-5 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-semibold text-gray-800 text-sm truncate">{state.store.name}</span>
            <span className="hidden xs:inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize flex-shrink-0">
              {state.store.type}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="hidden sm:inline"><Clock /></span>
            {/* Role badge */}
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
              ${isOwner ? 'bg-[#ea580c]/10 text-[#ea580c]' : 'bg-blue-50 text-blue-600'}`}>
              {isOwner ? <Crown size={12} weight="bold" /> : <IdentificationCard size={12} weight="bold" />}
              <span className="hidden sm:inline">{isOwner ? 'Owner' : 'Cashier'}</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#ea580c]/10 flex items-center justify-center text-xs font-semibold text-[#ea580c] flex-shrink-0">
                {currentUser?.name?.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm text-gray-600">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar — mobile/tablet only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#1a1f2e] flex items-stretch z-30 flex-shrink-0">
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-all
              ${isActive ? 'text-[#ea580c]' : 'text-gray-500'}`
            }>
            <Icon size={20} weight="bold" />
            <span className="text-[10px] font-medium">{label}</span>
            {!!badge && (
              <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-700 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
        <button onClick={logout} title="Lock / switch user"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500">
          <LockKey size={20} weight="bold" />
          <span className="text-[10px] font-medium">Lock</span>
        </button>
      </nav>
    </div>
  )
}
