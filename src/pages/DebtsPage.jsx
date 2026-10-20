import React, { useState } from 'react'
import { HandCoins, MagnifyingGlass, X, CheckCircle, Receipt, CaretDown, CaretUp } from '@phosphor-icons/react'
import { usePOS } from '../context/POSContext'

function RecordPaymentModal({ debt, onSave, onClose }) {
  const [amount, setAmount] = useState('')
  const numeric = parseFloat(amount) || 0
  const valid = numeric > 0 && numeric <= debt.amountOwed

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Record payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} weight="bold" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <div className="font-semibold text-gray-800 text-sm">{debt.customerName}</div>
            <div className="text-xs text-gray-400">{debt.phone}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-amber-700 font-medium">Balance owed</span>
            <span className="font-bold text-amber-700">₦{debt.amountOwed.toLocaleString()}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment amount (₦) *</label>
            <input type="number" min="0" max={debt.amountOwed} value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#ea580c]" />
            {numeric > debt.amountOwed && (
              <p className="text-xs text-red-500 mt-1">Cannot exceed the outstanding balance</p>
            )}
          </div>
          <button onClick={() => setAmount(String(debt.amountOwed))}
            className="text-xs font-medium text-[#ea580c] hover:underline">
            Pay full balance (₦{debt.amountOwed.toLocaleString()})
          </button>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => valid && onSave(numeric)} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl bg-[#ea580c] text-white text-sm font-semibold hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {numeric >= debt.amountOwed && numeric > 0 ? 'Mark fully paid' : 'Record partial payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DebtItemsModal({ debt, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">{debt.customerName}</h2>
            <p className="text-xs text-gray-400">{new Date(debt.date).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} weight="bold" /></button>
        </div>
        <div className="p-5">
          <div className="space-y-1.5 mb-4">
            {debt.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="font-medium">₦{item.lineTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500"><span>Original amount</span><span>₦{debt.originalAmount.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
              <span>Balance owed</span><span className="text-[#ea580c]">₦{debt.amountOwed.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DebtsPage() {
  const { dispatch, outstandingDebts, settledDebts, totalOutstandingDebt } = usePOS()
  const [search, setSearch]           = useState('')
  const [payDebt, setPayDebt]         = useState(null)
  const [viewDebt, setViewDebt]       = useState(null)
  const [showSettled, setShowSettled] = useState(false)
  const [flash, setFlash]             = useState(null)

  const filtered = outstandingDebts.filter(d =>
    d.customerName.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  )

  function handleSavePayment(amount) {
    dispatch({ type: 'RECORD_PAYMENT', payload: { debtId: payDebt.id, amount } })
    const fullyPaid = amount >= payDebt.amountOwed
    setFlash(`₦${amount.toLocaleString()} recorded for ${payDebt.customerName}${fullyPaid ? ' — fully paid!' : ''}`)
    setPayDebt(null)
    setTimeout(() => setFlash(null), 3000)
  }

  return (
    <div className="h-full flex flex-col p-3 sm:p-5 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-gray-800">Customer Debts</h1>
          <p className="text-sm text-gray-400 truncate">
            {outstandingDebts.length} customer{outstandingDebts.length === 1 ? '' : 's'} owe ₦{totalOutstandingDebt.toLocaleString()}
          </p>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 flex-shrink-0">
          <CheckCircle size={18} weight="fill" className="text-green-600 flex-shrink-0" />
          {flash}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Total outstanding</div>
          <div className="text-2xl font-semibold text-amber-600">₦{totalOutstandingDebt.toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="text-xs text-gray-400 mb-1">Customers owing</div>
          <div className="text-2xl font-semibold text-gray-800">{outstandingDebts.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-shrink-0">
        <MagnifyingGlass size={18} weight="bold" className="text-gray-400" />
        <input type="text" placeholder="Search customer name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white border border-gray-100 rounded-2xl">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300 gap-2">
            <HandCoins size={40} weight="bold" />
            <span className="text-sm">{outstandingDebts.length === 0 ? 'No outstanding debts' : 'No customers found'}</span>
          </div>
        ) : (
          <table className="w-full text-sm sm:min-w-[480px] md:min-w-[560px]">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owed</th>
                <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.customerName}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-gray-500">{d.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      ₦{d.amountOwed.toLocaleString()}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-gray-400 text-xs">
                    {new Date(d.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewDebt(d)} title="View items purchased"
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
                        <Receipt size={13} weight="bold" /> <span className="hidden lg:inline">Items</span>
                      </button>
                      <button onClick={() => setPayDebt(d)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#ea580c] text-white hover:bg-[#c2410c]">
                        <HandCoins size={13} weight="bold" /> Record payment
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Settled history */}
      {settledDebts.length > 0 && (
        <div className="flex-shrink-0">
          <button onClick={() => setShowSettled(s => !s)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
            {showSettled ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
            Settled debts ({settledDebts.length})
          </button>
          {showSettled && (
            <div className="mt-2 bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 max-h-40 overflow-y-auto scrollbar-hide">
              {settledDebts.map(d => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div className="text-gray-700 font-medium">{d.customerName}</div>
                    <div className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}</div>
                  </div>
                  <span className="text-xs font-semibold text-green-600">₦{d.originalAmount.toLocaleString()} paid</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {payDebt && (
        <RecordPaymentModal debt={payDebt} onSave={handleSavePayment} onClose={() => setPayDebt(null)} />
      )}

      {viewDebt && (
        <DebtItemsModal debt={viewDebt} onClose={() => setViewDebt(null)} />
      )}
    </div>
  )
}
