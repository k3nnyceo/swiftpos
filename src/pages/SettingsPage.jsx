import React, { useState } from 'react'
import { Crown, IdentificationCard, CheckCircle, Trash } from '@phosphor-icons/react'
import { usePOS } from '../context/POSContext'
import { useAuth } from '../context/AuthContext'

function PINChangeCard({ user, onSave }) {
  const [newPin, setNewPin]     = useState('')
  const [confirm, setConfirm]   = useState('')
  const [status, setStatus]     = useState(null) // 'saved' | 'error'

  function handleSave() {
    if (newPin.length < 4)          { setStatus('error'); return }
    if (newPin !== confirm)          { setStatus('mismatch'); return }
    onSave(user.id, newPin)
    setNewPin(''); setConfirm('')
    setStatus('saved')
    setTimeout(() => setStatus(null), 2000)
  }

  const roleColor = user.role === 'owner' ? 'text-[#ea580c]' : 'text-blue-600'
  const roleBg    = user.role === 'owner' ? 'bg-[#ea580c]/10' : 'bg-blue-50'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${roleBg} flex items-center justify-center ${roleColor}`}>
          {user.role === 'owner' ? <Crown size={18} weight="bold" /> : <IdentificationCard size={18} weight="bold" />}
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">{user.name}</div>
          <div className={`text-xs font-medium capitalize ${roleColor}`}>{user.role}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New PIN</label>
          <input
            type="password" inputMode="numeric" maxLength={6}
            value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g,'')); setStatus(null) }}
            placeholder="Enter new PIN (4–6 digits)"
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm PIN</label>
          <input
            type="password" inputMode="numeric" maxLength={6}
            value={confirm} onChange={e => { setConfirm(e.target.value.replace(/\D/g,'')); setStatus(null) }}
            placeholder="Re-enter PIN"
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]"
          />
        </div>
        {status === 'error'    && <p className="text-xs text-red-500">PIN must be at least 4 digits</p>}
        {status === 'mismatch' && <p className="text-xs text-red-500">PINs do not match</p>}
        <button onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${status === 'saved' ? 'bg-green-500 text-white' : 'bg-[#1a1f2e] text-white hover:bg-[#252c3f]'}`}>
          {status === 'saved' && <CheckCircle size={16} weight="bold" />} {status === 'saved' ? 'PIN updated!' : 'Update PIN'}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { state, dispatch } = usePOS()
  const { users, updatePin, updateName } = useAuth()
  const [form, setForm]   = useState({ ...state.store })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    dispatch({ type: 'UPDATE_STORE', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-3 sm:p-5 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-400">Store configuration — owner only</p>
      </div>

      {/* Store config */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Store information</h2>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Store name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Store type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c] bg-white">
              <option value="pharmacy">Pharmacy</option>
              <option value="supermarket">Supermarket</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">VAT rate (%)</label>
            <input type="number" min="0" max="100" step="0.5"
              value={form.vatRate * 100}
              onChange={e => setForm(f => ({ ...f, vatRate: parseFloat(e.target.value) / 100 || 0 }))}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cashier display name</label>
          <input value={form.cashierName} onChange={e => setForm(f => ({ ...f, cashierName: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]" />
        </div>
        <button onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${saved ? 'bg-green-500 text-white' : 'bg-[#ea580c] text-white hover:bg-[#c2410c]'}`}>
          {saved && <CheckCircle size={16} weight="bold" />} {saved ? 'Saved!' : 'Save settings'}
        </button>
      </div>

      {/* PIN management */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Change PINs</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {users.map(user => (
            <PINChangeCard key={user.id} user={user} onSave={updatePin} />
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Danger zone</h2>
        <p className="text-xs text-red-400 mb-3">Clears all products and sales. Use only when setting up for a new store.</p>
        <button
          onClick={() => { if (window.confirm('This will erase ALL data. Are you sure?')) { localStorage.clear(); window.location.reload() } }}
          className="flex items-center gap-1.5 text-xs px-4 py-2 bg-white border border-red-200 rounded-xl text-red-600 hover:bg-red-50 font-medium">
          <Trash size={14} weight="bold" /> Clear all data & restart
        </button>
      </div>
    </div>
  )
}
