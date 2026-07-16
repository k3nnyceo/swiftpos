import { NavLink } from 'react-router-dom';
import {
  ShoppingCart, Package, BarChart2, Settings, AlertTriangle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const navItems = [
  { to: '/',          icon: ShoppingCart, label: 'Sales'     },
  { to: '/inventory', icon: Package,      label: 'Inventory' },
  { to: '/reports',   icon: BarChart2,    label: 'Reports'   },
  { to: '/settings',  icon: Settings,     label: 'Settings'  },
];

export default function Sidebar() {
  const { lowStockItems, outOfStock } = useStore();
  const alertCount = lowStockItems.length + outOfStock.length;

  return (
    <aside className="w-14 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-1 shrink-0">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          title={label}
          className={({ isActive }) =>
            `relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors
             ${isActive
               ? 'bg-brand-50 text-brand-500'
               : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
             }`
          }
        >
          <Icon size={18} />
          {/* Alert badge on Inventory icon */}
          {label === 'Inventory' && alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full
                             flex items-center justify-center text-white text-[9px] font-bold">
              {alertCount}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
}
