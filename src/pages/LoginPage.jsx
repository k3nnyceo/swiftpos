import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [pin, setPin]     = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleKey(val) {
    if (val === 'del') { setPin(p => p.slice(0, -1)); setError(false); return }
    if (pin.length >= 4) return
    const next = pin + val
    setPin(next)
    setError(false)
    if (next.length === 4) setTimeout(() => attemptLogin(next), 150)
  }

  function attemptLogin(p) {
    const result = login(p)
    if (!result.success) {
      setShake(true)
      setError(true)
      setPin('')
      setTimeout(() => setShake(false), 600)
    }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

  return (
    <div className="min-h-screen bg-[#1a1f2e] flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-[#e8622a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">SP</span>
        </div>
        <h1 className="text-white text-2xl font-bold">SwiftPOS</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your 4-digit PIN</p>
      </div>

      {/* 4 dots */}
      <div className={`flex gap-4 mb-6 ${shake ? 'animate-bounce' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-150
            ${i < pin.length
              ? error ? 'bg-red-500 border-red-500' : 'bg-[#e8622a] border-[#e8622a]'
              : 'border-gray-600 bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="h-6 mb-4 flex items-center justify-center">
        {error && <p className="text-red-400 text-sm font-medium">Incorrect PIN — try again</p>}
      </div>

      <div className="grid grid-cols-3 gap-3 w-64">
        {KEYS.map((k, i) => {
          if (k === '') return <div key={i} />
          if (k === 'del') return (
            <button key={i} onClick={() => handleKey('del')}
              className="h-16 rounded-2xl bg-[#252c3f] border border-[#2f3850] text-gray-400 text-xl flex items-center justify-center hover:bg-[#2f3850] active:scale-95 transition-all">
              ⌫
            </button>
          )
          return (
            <button key={i} onClick={() => handleKey(k)}
              className="h-16 rounded-2xl bg-[#252c3f] border border-[#2f3850] text-white text-xl font-semibold flex items-center justify-center hover:bg-[#2f3850] hover:border-[#e8622a] active:scale-95 transition-all select-none">
              {k}
            </button>
          )
        })}
      </div>

      <p className="text-gray-600 text-xs mt-8 text-center">
        Owner PIN: <span className="text-gray-400">1234</span> &nbsp;·&nbsp; Cashier PIN: <span className="text-gray-400">0000</span>
      </p>
    </div>
  )
}
