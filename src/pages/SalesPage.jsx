import React, { useState, useCallback } from 'react'
import { usePOS } from '../context/POSContext'
import BarcodeScanner from '../components/BarcodeScanner'
import useUSBScanner from '../hooks/useUSBScanner'
import { printReceipt, whatsappReceipt } from '../utils/printReceipt'

const CATEGORY_EMOJI = {
  Drugs: '💊', Vitamins: '🍊', Sundries: '🧤',
  Beverages: '🥤', 'Personal Care': '🧴',
}

function ProductCard({ product, onAdd }) {
  const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold
  const isOut = product.stock === 0
  return (
    <button onClick={() => !isOut && onAdd(product.id)} disabled={isOut}
      className={`relative p-3 rounded-xl border text-left transition-all active:scale-95
        ${isOut ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
          : isLow ? 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:shadow-sm cursor-pointer'
          : 'border-gray-200 bg-white hover:border-[#e8622a] hover:shadow-sm cursor-pointer'}`}>
      <div className="text-2xl mb-2">{CATEGORY_EMOJI[product.category] || '📦'}</div>
      <div className="font-medium text-gray-800 text-xs leading-tight mb-1">{product.name}</div>
      <div className="text-[#e8622a] font-semibold text-sm">₦{product.price.toLocaleString()}</div>
      <div className={`text-[10px] mt-1 font-medium ${isOut ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-gray-400'}`}>
        {isOut ? 'Out of stock' : isLow ? `Low: ${product.stock} left` : `Stock: ${product.stock}`}
      </div>
      {product.barcode && (
        <div className="text-[9px] text-gray-300 mt-1 font-mono truncate">{product.barcode}</div>
      )}
    </button>
  )
}

function CartItem({ item, onIncrease, onDecrease }) {
  const { product, qty } = item
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{product.name}</div>
        <div className="text-xs text-gray-400">₦{product.price.toLocaleString()} each</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onDecrease(product.id)} className="w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 flex items-center justify-center">−</button>
        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
        <button onClick={() => onIncrease(product.id)} className="w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 flex items-center justify-center">+</button>
      </div>
      <div className="text-sm font-semibold text-[#e8622a] w-16 text-right">₦{(product.price * qty).toLocaleString()}</div>
    </div>
  )
}

function ReceiptModal({ sale, store, onClose }) {
  if (!sale) return null
  const [printing, setPrinting] = useState(false)

  function handlePrint() {
    setPrinting(true)
    printReceipt(sale, store)
    setTimeout(() => setPrinting(false), 1000)
  }

  function handleWhatsApp() {
    whatsappReceipt(sale, store)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* Header */}
        <div className="bg-[#1a1f2e] rounded-t-2xl p-5 text-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-xl">✓</span>
          </div>
          <div className="text-white font-bold text-lg">Sale complete!</div>
          <div className="text-gray-400 text-xs mt-1">{sale.receiptNo}</div>
        </div>

        {/* Receipt preview */}
        <div className="p-5">
          <div className="text-xs text-gray-400 mb-3">
            {new Date(sale.timestamp).toLocaleString()} · {sale.paymentMethod}
          </div>
          <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.name} × {item.qty}</span>
                <span className="font-medium">₦{item.lineTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₦{sale.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>VAT (7.5%)</span><span>₦{sale.vat.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-100">
              <span>Total paid</span>
              <span className="text-[#e8622a]">₦{sale.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 space-y-2">
          {/* Print thermal receipt */}
          <button onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1f2e] text-white text-sm font-semibold hover:bg-[#252c3f] transition-colors">
            {printing ? '🖨️ Opening printer...' : '🖨️ Print receipt'}
          </button>

          {/* WhatsApp receipt */}
          <button onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20b858] transition-colors">
            💬 Send via WhatsApp
          </button>

          {/* Close */}
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function UnknownBarcodeModal({ barcode, onClose, onAssign }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
        <div className="text-4xl text-center mb-3">🔍</div>
        <h3 className="font-semibold text-gray-800 text-center mb-1">Barcode not found</h3>
        <p className="text-sm text-gray-500 text-center mb-2">No product matched this barcode:</p>
        <div className="bg-gray-100 rounded-xl px-4 py-2 text-center font-mono text-sm text-gray-700 mb-5">{barcode}</div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Dismiss</button>
          <button onClick={() => onAssign(barcode)} className="flex-1 py-2.5 rounded-xl bg-[#e8622a] text-white text-sm font-semibold hover:bg-[#d4541f]">Assign to product</button>
        </div>
      </div>
    </div>
  )
}

function AssignBarcodeModal({ barcode, products, onSave, onClose }) {
  const [selected, setSelected] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-1">Assign barcode</h3>
        <p className="text-xs text-gray-400 font-mono mb-4">{barcode}</p>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#e8622a] mb-4 bg-white">
          <option value="">Select a product...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => selected && onSave(selected, barcode)} disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-[#e8622a] text-white text-sm font-semibold hover:bg-[#d4541f] disabled:opacity-40">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SalesPage() {
  const { state, dispatch, filteredProducts, categories, cartItems, cartCount, subtotal, vat, cartTotal, lowStockItems, outOfStockItems } = usePOS()
  const [lastSale,       setLastSale]       = useState(null)
  const [showCamera,     setShowCamera]     = useState(false)
  const [unknownBarcode, setUnknownBarcode] = useState(null)
  const [assignBarcode,  setAssignBarcode]  = useState(null)
  const [scanFlash,      setScanFlash]      = useState(null)
  const alertCount = lowStockItems.length + outOfStockItems.length

  const handleBarcode = useCallback((code) => {
    setShowCamera(false)
    const product = state.products.find(p => p.barcode === code)
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: product.id })
      setScanFlash(product.name)
      setTimeout(() => setScanFlash(null), 1500)
    } else {
      setUnknownBarcode(code)
    }
  }, [state.products, dispatch])

  useUSBScanner(handleBarcode, !showCamera)

  function completeSale(method) {
    if (!cartItems.length) return
    const items = cartItems.map(i => ({ ...i.product, qty: i.qty, lineTotal: i.product.price * i.qty }))
    const sale = {
      id: Date.now(), items, subtotal, vat, total: cartTotal,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
      receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
    }
    dispatch({ type: 'COMPLETE_SALE', payload: { paymentMethod: method } })
    setLastSale(sale)
  }

  function handleAssignSave(productId, barcode) {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, barcode } })
    setAssignBarcode(null)
    setUnknownBarcode(null)
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">

        {scanFlash && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 flex-shrink-0">
            ✅ <strong>{scanFlash}</strong> added to cart
          </div>
        )}

        {alertCount > 0 && !scanFlash && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 flex-shrink-0">
            ⚠️ <span><strong>{alertCount} item{alertCount > 1 ? 's' : ''}</strong> need attention</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <span className="text-gray-400">🔍</span>
            <input type="text" placeholder="Search product name..."
              value={state.searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
            {state.searchQuery && (
              <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
          <button onClick={() => setShowCamera(true)} title="Scan with camera"
            className="w-11 h-11 bg-[#1a1f2e] text-white rounded-xl flex items-center justify-center text-xl hover:bg-[#252c3f] transition-colors flex-shrink-0">
            📷
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
          <span>📡</span> USB scanner active — scan any product to add it instantly
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
                ${state.activeCategory === cat ? 'bg-[#e8622a] text-white border-[#e8622a]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#e8622a] hover:text-[#e8622a]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredProducts.length === 0
            ? <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2"><span className="text-4xl">🔍</span><span className="text-sm">No products found</span></div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={id => dispatch({ type: 'ADD_TO_CART', payload: id })} />)}
              </div>
          }
        </div>
      </div>

      {/* Cart */}
      <div className="w-72 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-800 text-sm">Current sale</span>
          {cartCount > 0 && <span className="text-xs bg-[#e8622a]/10 text-[#e8622a] px-2 py-0.5 rounded-full font-medium">{cartCount} item{cartCount > 1 ? 's' : ''}</span>}
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
          {cartItems.length === 0
            ? <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 py-12"><span className="text-5xl">🛒</span><span className="text-sm">Tap a product to add it</span></div>
            : cartItems.map(item => <CartItem key={item.product.id} item={item} onIncrease={id => dispatch({ type: 'ADD_TO_CART', payload: id })} onDecrease={id => dispatch({ type: 'REMOVE_FROM_CART', payload: id })} />)
          }
        </div>
        <div className="border-t border-gray-100 px-4 py-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>VAT (7.5%)</span><span>₦{vat.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100"><span>Total</span><span className="text-[#e8622a]">₦{cartTotal.toLocaleString()}</span></div>
        </div>
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          <button onClick={() => completeSale('Cash')} disabled={!cartItems.length} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">💵 Cash</button>
          <button onClick={() => completeSale('Transfer')} disabled={!cartItems.length} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">📲 Transfer</button>
          <button onClick={() => completeSale('POS')} disabled={!cartItems.length} className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3ecf8e] text-white font-semibold text-sm hover:bg-[#34b87d] disabled:opacity-40 disabled:cursor-not-allowed transition-all">💳 Charge & print receipt</button>
        </div>
      </div>

      {showCamera && <BarcodeScanner onDetected={handleBarcode} onClose={() => setShowCamera(false)} />}

      {unknownBarcode && !assignBarcode && (
        <UnknownBarcodeModal barcode={unknownBarcode} onClose={() => setUnknownBarcode(null)} onAssign={b => setAssignBarcode(b)} />
      )}

      {assignBarcode && (
        <AssignBarcodeModal barcode={assignBarcode} products={state.products} onSave={handleAssignSave} onClose={() => { setAssignBarcode(null); setUnknownBarcode(null) }} />
      )}

      {lastSale && (
        <ReceiptModal sale={lastSale} store={state.store} onClose={() => setLastSale(null)} />
      )}
    </div>
  )
}
