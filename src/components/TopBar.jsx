import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function TopBar() {
  const { storeInfo } = useStore();
  const [time, setTime] = useState('');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const initials = storeInfo.cashierName
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="h-11 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
      {/* Store name */}
      <span className="font-semibold text-gray-800 text-sm">{storeInfo.name}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
        {storeInfo.type}
      </span>

      <div className="flex-1" />

      {/* Online indicator */}
      <span className={`flex items-center gap-1 text-xs ${online ? 'text-green-600' : 'text-red-500'}`}>
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online ? 'Online' : 'Offline — data saved locally'}
      </span>

      {/* Clock */}
      <span className="text-xs text-gray-400">{time}</span>

      {/* Cashier avatar */}
      <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-500 text-xs font-semibold
                      flex items-center justify-center border border-brand-100">
        {initials}
      </div>
    </header>
  );
}
