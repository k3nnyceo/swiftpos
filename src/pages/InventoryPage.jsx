import React, { useState } from 'react'
import { usePOS } from '../context/POSContext'

const CATEGORIES = ['Drugs', 'Vitamins', 'Sundries', 'Beverages', 'Personal Care', 'Other']

function ProductModal({ product, onSave, onClose }) {
  const isEdit = !!product?.id
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Drugs',
    price: product?.price || '',
    stock: product?.stock || '',
    lowStockThreshold: product?.lowStockThreshold || 10,
    unit: product?.unit || 'unit',
    expiry: product?.expiry || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.price > 0 && form.stock >= 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Product name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a] bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</label>
              <input value={form.unit} onChange={e => set('unit', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" placeholder="tablet, bottle..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price (₦) *</label>
              <input type="number" min="0" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || '')} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stock qty *</label>
              <input type="number" min="0" value={form.stock} onChange={e => set('stock', parseInt(e.target.value) || 0)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low stock alert at</label>
              <input type="number" min="1" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', parseInt(e.target.value) || 5)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiry (YYYY-MM)</label>
              <input value={form.expiry} onChange={e => set('expiry', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e8622a]" placeholder="2026-12" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => valid && onSave({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock), ...(isEdit ? { id: product.id } : {}) })} disabled={!valid} className="flex-1 py-2.5 rounded-xl bg-[#e8622a] text-white text-sm font-semibold hover:bg-[#d4541f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const { state, dispatch, lowStockItems, outOfStockItems } = usePOS()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | product object

  const filtered = state.products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave(data) {
    if (data.id) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: data })
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: data })
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this product?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id })
    }
  }

  function stockStatus(p) {
    if (p.stock === 0) return { label: 'Out of stock', cls: 'text-red-600 font-semibold' }
    if (p.stock <= p.lowStockThreshold) return { label: `${p.stock} — low`, cls: 'text-amber-600 font-semibold' }
    return { label: p.stock.toString(), cls: 'text-green-600 font-semibold' }
  }

  return (
    <div className="h-full flex flex-col p-5 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Inventory</h1>
          <p className="text-sm text-gray-400">{state.products.length} products · {lowStockItems.length + outOfStockItems.length} alerts</p>
        </div>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 px-4 py-2 bg-[#e8622a] text-white rounded-xl text-sm font-semibold hover:bg-[#d4541f] transition-colors">
          + Add product
        </button>
      </div>

      {/* Alert summary */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="flex gap-3 flex-shrink-0">
          {outOfStockItems.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
              🔴 <strong>{outOfStockItems.length}</strong> out of stock
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
              ⚠️ <strong>{lowStockItems.length}</strong> running low
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-shrink-0">
        <span className="text-gray-400">🔍</span>
        <input type="text" placeholder="Search products or categories..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-white border border-gray-100 rounded-2xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Expiry', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const { label, cls } = stockStatus(p)
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3 text-gray-700">₦{p.price.toLocaleString()}</td>
                  <td className={`px-4 py-3 ${cls}`}>{label}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.expiry || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(p)} className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs px-2.5 py-1 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || (modal && modal.id)) && (
        <ProductModal product={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
