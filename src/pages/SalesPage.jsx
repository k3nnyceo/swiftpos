import React, { useState, useCallback } from 'react'
import {
  Pill, Orange, HandSoap, Coffee, SprayBottle, Package,
  MagnifyingGlass, Camera, X, Warning, CheckCircle, Minus, Plus,
  Money, DeviceMobile, CreditCard, Printer, WhatsappLogo, ShoppingCart, Barcode,
  HandCoins, User, Phone,
} from '@phosphor-icons/react'
import { usePOS } from '../context/POSContext'
import BarcodeScanner from '../components/BarcodeScanner'
import useUSBScanner from '../hooks/useUSBScanner'
import { printReceipt, whatsappReceipt } from '../utils/printReceipt'

const CATEGORY_ICON = {
  Drugs: Pill, Vitamins: Orange, Sundries: HandSoap,
  Beverages: Coffee, 'Personal Care': SprayBottle,
}

function ProductCard({ product, onAdd }) {
  const isLow = product.stock > 0 && product.stock <= product.lowStockThreshold
  const isOut = product.stock === 0
  const Icon = CATEGORY_ICON[product.category] || Package

  return (
    <button onClick={() => !isOut && onAdd(product.id)} disabled={isOut}
      className={`relative overflow-hidden p-4 pb-9 rounded-xl border text-left transition-all active:scale-95 min-h-[136px]
        ${isOut ? 'border-red-700/30 bg-gray-50 cursor-not-allowed'
          : isLow ? 'border-yellow-600 bg-yellow-50 hover:shadow-sm cursor-pointer'
          : 'border-gray-200 bg-white hover:border-[#ea580c] hover:shadow-sm cursor-pointer'}`}>

      {isOut && (
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }} />
      )}

      <Icon size={26} weight="bold" className={isOut ? 'text-gray-400' : isLow ? 'text-yellow-700' : 'text-[#ea580c]'} />
      <div className={`font-semibold text-xs leading-tight mt-2 mb-1 ${isOut ? 'text-gray-400' : 'text-gray-800'}`}>{product.name}</div>
      <div className={`font-extrabold text-lg ${isOut ? 'text-gray-400' : 'text-[#ea580c]'}`}>₦{product.price.toLocaleString()}</div>
      {product.barcode && (
        <div className="text-[9px] text-gray-300 mt-1 font-mono truncate">{product.barcode}</div>
      )}

      {/* Full-width stock status strip */}
      <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-center text-[11px] font-bold
        ${isOut ? 'bg-red-700 text-white' : isLow ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {isOut ? 'OUT OF STOCK' : isLow ? `LOW · ${product.stock} LEFT` : `Stock: ${product.stock}`}
      </div>
    </button>
  )
}

function CartItem({ item, onIncrease, onDecrease }) {
  const { product, qty } = item
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{product.name}</div>
        <div className="text-xs text-gray-400">₦{product.price.toLocaleString()} each</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onDecrease(product.id)}
          className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Minus size={16} weight="bold" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
        <button onClick={() => onIncrease(product.id)}
          className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Plus size={16} weight="bold" />
        </button>
      </div>
      <div className="text-sm font-semibold text-[#ea580c] w-16 text-right">₦{(product.price * qty).toLocaleString()}</div>
    </div>
  )
}

function CartPanel({ cartItems, cartCount, subtotal, vat, cartTotal, dispatch, completeSale, onCredit, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="font-semibold text-gray-800 text-sm">Current sale</span>
        <div className="flex items-center gap-2">
          {cartCount > 0 && <span className="text-xs bg-[#ea580c]/10 text-[#ea580c] px-2 py-0.5 rounded-full font-medium">{cartCount} item{cartCount > 1 ? 's' : ''}</span>}
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 md:hidden">
              <X size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
        {cartItems.length === 0
          ? <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 py-12">
              <ShoppingCart size={48} weight="bold" />
              <span className="text-sm">Tap a product to add it</span>
            </div>
          : cartItems.map(item => <CartItem key={item.product.id} item={item} onIncrease={id => dispatch({ type: 'ADD_TO_CART', payload: id })} onDecrease={id => dispatch({ type: 'REMOVE_FROM_CART', payload: id })} />)
        }
      </div>
      <div className="border-t border-gray-100 px-4 py-3 space-y-1.5 flex-shrink-0">
        <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm text-gray-500"><span>VAT (7.5%)</span><span>₦{vat.toLocaleString()}</span></div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100"><span>Total</span><span className="text-[#ea580c]">₦{cartTotal.toLocaleString()}</span></div>
      </div>
      <div className="px-4 pb-4 space-y-2 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => completeSale('Cash')} disabled={!cartItems.length} className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Money size={16} weight="bold" /> Cash
          </button>
          <button onClick={() => completeSale('Transfer')} disabled={!cartItems.length} className="flex items-center justify-center gap-1.5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <DeviceMobile size={16} weight="bold" /> Transfer
          </button>
        </div>
        <button onClick={onCredit} disabled={!cartItems.length} className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-amber-300 bg-amber-50 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <HandCoins size={16} weight="bold" /> Sell on credit
        </button>
        <button onClick={() => completeSale('POS')} disabled={!cartItems.length} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3ecf8e] text-white font-semibold text-sm hover:bg-[#34b87d] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <CreditCard size={18} weight="bold" /> Charge & print receipt
        </button>
      </div>
    </>
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
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="bg-[#1a1f2e] rounded-t-2xl p-5 text-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${sale.paymentMethod === 'Credit' ? 'bg-amber-500' : 'bg-green-500'}`}>
            {sale.paymentMethod === 'Credit'
              ? <HandCoins size={22} weight="fill" className="text-white" />
              : <CheckCircle size={22} weight="fill" className="text-white" />}
          </div>
          <div className="text-white font-bold text-lg">
            {sale.paymentMethod === 'Credit' ? 'Sale recorded on credit' : 'Sale complete!'}
          </div>
          <div className="text-gray-400 text-xs mt-1">{sale.receiptNo}</div>
        </div>

        {/* Receipt preview */}
        <div className="p-5">
          <div className="text-xs text-gray-400 mb-3">
            {new Date(sale.timestamp).toLocaleString()} · {sale.paymentMethod}
          </div>
          {sale.paymentMethod === 'Credit' && sale.customer && (
            <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
              <div className="font-semibold">{sale.customer.name}</div>
              <div>{sale.customer.phone}</div>
            </div>
          )}
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
              <span>{sale.paymentMethod === 'Credit' ? 'Amount owed' : 'Total paid'}</span>
              <span className="text-[#ea580c]">₦{sale.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 space-y-2">
          {/* Print thermal receipt */}
          <button onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1f2e] text-white text-sm font-semibold hover:bg-[#252c3f] transition-colors">
            <Printer size={17} weight="bold" /> {printing ? 'Opening printer...' : 'Print receipt'}
          </button>

          {/* WhatsApp receipt */}
          <button onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20b858] transition-colors">
            <WhatsappLogo size={17} weight="fill" /> Send via WhatsApp
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
        <MagnifyingGlass size={40} weight="bold" className="text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-800 text-center mb-1">Barcode not found</h3>
        <p className="text-sm text-gray-500 text-center mb-2">No product matched this barcode:</p>
        <div className="bg-gray-100 rounded-xl px-4 py-2 text-center font-mono text-sm text-gray-700 mb-5">{barcode}</div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Dismiss</button>
          <button onClick={() => onAssign(barcode)} className="flex-1 py-2.5 rounded-xl bg-[#ea580c] text-white text-sm font-semibold hover:bg-[#c2410c]">Assign to product</button>
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
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#ea580c] mb-4 bg-white">
          <option value="">Select a product...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => selected && onSave(selected, barcode)} disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-[#ea580c] text-white text-sm font-semibold hover:bg-[#c2410c] disabled:opacity-40">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function CreditCustomerModal({ total, onConfirm, onClose }) {
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 7

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl max-h-[92vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Sell on credit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} weight="bold" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-500">
            Record who owes <strong className="text-[#ea580c]">₦{total.toLocaleString()}</strong> for this sale.
          </p>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer name *</label>
            <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#ea580c]">
              <User size={16} weight="bold" className="text-gray-400 flex-shrink-0" />
              <input autoFocus value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Mrs. Adebayo"
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone number *</label>
            <div className="mt-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#ea580c]">
              <Phone size={16} weight="bold" className="text-gray-400 flex-shrink-0" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="080..."
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={() => valid && onConfirm({ name: name.trim(), phone: phone.trim() })} disabled={!valid}
            className="flex-1 py-2.5 rounded-xl bg-[#ea580c] text-white text-sm font-semibold hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Confirm credit sale
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
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
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

  function completeSale(method, customer = null) {
    if (!cartItems.length) return
    const items = cartItems.map(i => ({ ...i.product, qty: i.qty, lineTotal: i.product.price * i.qty }))
    const sale = {
      id: Date.now(), items, subtotal, vat, total: cartTotal,
      paymentMethod: method,
      customer: method === 'Credit' ? customer : null,
      timestamp: new Date().toISOString(),
      receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
    }
    dispatch({ type: 'COMPLETE_SALE', payload: { paymentMethod: method, customer } })
    setLastSale(sale)
    setShowMobileCart(false)
    setShowCreditModal(false)
  }

  function handleAssignSave(productId, barcode) {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, barcode } })
    setAssignBarcode(null)
    setUnknownBarcode(null)
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 gap-3 min-w-0">

        {scanFlash && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 flex-shrink-0">
            <CheckCircle size={18} weight="fill" className="text-green-600 flex-shrink-0" />
            <strong>{scanFlash}</strong> added to cart
          </div>
        )}

        {alertCount > 0 && !scanFlash && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-2.5 text-sm text-yellow-800 flex-shrink-0">
            <Warning size={18} weight="fill" className="text-yellow-600 flex-shrink-0" />
            <span><strong>{alertCount} item{alertCount > 1 ? 's' : ''}</strong> need attention</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <MagnifyingGlass size={18} weight="bold" className="text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search product name..."
              value={state.searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
            {state.searchQuery && (
              <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} className="text-gray-400 hover:text-gray-600">
                <X size={16} weight="bold" />
              </button>
            )}
          </div>
          <button onClick={() => setShowCamera(true)} title="Scan with camera"
            className="w-11 h-11 bg-[#1a1f2e] text-white rounded-xl flex items-center justify-center hover:bg-[#252c3f] transition-colors flex-shrink-0">
            <Camera size={20} weight="bold" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
          <Barcode size={14} weight="bold" /> USB scanner active — scan any product to add it instantly
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0 pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: cat })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border
                ${state.activeCategory === cat ? 'bg-[#ea580c] text-white border-[#ea580c]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#ea580c] hover:text-[#ea580c]'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
          {filteredProducts.length === 0
            ? <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                <MagnifyingGlass size={36} weight="bold" />
                <span className="text-sm">No products found</span>
              </div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={id => dispatch({ type: 'ADD_TO_CART', payload: id })} />)}
              </div>
          }
        </div>
      </div>

      {/* Cart — static side panel on desktop/tablet */}
      <div className="hidden md:flex w-72 bg-white border-l border-gray-100 flex-col flex-shrink-0">
        <CartPanel {...{ cartItems, cartCount, subtotal, vat, cartTotal, dispatch, completeSale }} onCredit={() => setShowCreditModal(true)} />
      </div>

      {/* Mobile cart summary bar — tap to open drawer */}
      {cartItems.length > 0 && (
        <button onClick={() => setShowMobileCart(true)}
          className="md:hidden fixed bottom-16 inset-x-0 z-20 mx-3 mb-2 rounded-xl bg-[#1a1f2e] text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart size={18} weight="bold" />
            {cartCount} item{cartCount > 1 ? 's' : ''}
          </span>
          <span className="text-sm font-bold text-[#ea580c]">₦{cartTotal.toLocaleString()} · View cart</span>
        </button>
      )}

      {/* Mobile cart drawer */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 flex flex-col justify-end" onClick={() => setShowMobileCart(false)}>
          <div className="bg-white rounded-t-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <CartPanel {...{ cartItems, cartCount, subtotal, vat, cartTotal, dispatch, completeSale }} onCredit={() => setShowCreditModal(true)} onClose={() => setShowMobileCart(false)} />
          </div>
        </div>
      )}

      {showCamera && <BarcodeScanner onDetected={handleBarcode} onClose={() => setShowCamera(false)} />}

      {unknownBarcode && !assignBarcode && (
        <UnknownBarcodeModal barcode={unknownBarcode} onClose={() => setUnknownBarcode(null)} onAssign={b => setAssignBarcode(b)} />
      )}

      {assignBarcode && (
        <AssignBarcodeModal barcode={assignBarcode} products={state.products} onSave={handleAssignSave} onClose={() => { setAssignBarcode(null); setUnknownBarcode(null) }} />
      )}

      {showCreditModal && (
        <CreditCustomerModal total={cartTotal} onConfirm={customer => completeSale('Credit', customer)} onClose={() => setShowCreditModal(false)} />
      )}

      {lastSale && (
        <ReceiptModal sale={lastSale} store={state.store} onClose={() => setLastSale(null)} />
      )}
    </div>
  )
}
