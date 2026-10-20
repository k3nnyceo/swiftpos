import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { title: 'Create your owner PIN',   hint: 'Choose 4 digits only you will know' },
  { title: 'Confirm your owner PIN',  hint: 'Enter the same 4 digits again' },
  { title: 'Create a cashier PIN',    hint: 'Staff use this PIN to make sales. It must be different' },
  { title: 'Confirm the cashier PIN', hint: 'Enter the same 4 digits again' },
]

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del']

export default function SetupPage() {
  const { setupUsers } = useAuth()
  const [step, setStep]         = useState(0)
  const [pin, setPin]           = useState('')
  const [ownerPin, setOwnerPin] = useState('')
  const [cashierPin, setCashierPin] = useState('')
  const [error, setError]       = useState('')

  function handleKey(val) {
    if (val === 'del') { setPin(p => p.slice(0, -1)); setError(''); return }
    if (pin.length >= 4) return
    const next = pin + val
    setPin(next)
    setError('')
    if (next.length === 4) setTimeout(() => submit(next), 150)
  }

  function submit(value) {
    if (step === 0) { setOwnerPin(value); setPin(''); setStep(1); return }
    if (step === 1) {
      if (value !== ownerPin) { setError("PINs didn't match — start again"); setPin(''); setOwnerPin(''); setStep(0); return }
      setPin(''); setStep(2); return
    }
    if (step === 2) {
      if (value === ownerPin) { setError('Cashier PIN must be different from the owner PIN'); setPin(''); return }
      setCashierPin(value); setPin(''); setStep(3); return
    }
    if (value !== cashierPin) { setError("PINs didn't match — try the cashier PIN again"); setPin(''); setCashierPin(''); setStep(2); return }
    setupUsers(ownerPin, value)
  }

  return (
    <div className="min-h-[100dvh] bg-[#1a1f2e] flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-[#ea580c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-2xl">SP</span>
        </div>
        <h1 className="text-white text-2xl font-bold">Welcome to SwiftPOS</h1>
        <p className="text-gray-400 text-xs mt-1">Step {step + 1} of 4</p>
      </div>

      <h2 className="text-white font-semibold text-lg text-center">{STEPS[step].title}</h2>
      <p className="text-gray-400 text-sm mt-1 mb-5 text-center max-w-xs">{STEPS[step].hint}</p>

      <div className="flex gap-4 mb-4">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-150
            ${i < pin.length ? 'bg-[#ea580c] border-[#ea580c]' : 'border-gray-600 bg-transparent'}`} />
        ))}
      </div>

      <div className="h-6 mb-4 flex items-center justify-center">
        {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
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
              className="h-16 rounded-2xl bg-[#252c3f] border border-[#2f3850] text-white text-xl font-semibold flex items-center justify-center hover:bg-[#2f3850] hover:border-[#ea580c] active:scale-95 transition-all select-none">
              {k}
            </button>
          )
        })}
      </div>

      <p className="text-gray-600 text-xs mt-8 text-center max-w-xs">
        You can change these PINs later in Settings.
      </p>
    </div>
  )
}
