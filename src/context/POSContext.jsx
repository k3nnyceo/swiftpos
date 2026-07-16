import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { v4 as uuid } from 'uuid'

// ── Seed data (demo products) ────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: uuid(), name: 'Paracetamol 500mg', category: 'Drugs',         price: 150,  stock: 240, lowStockThreshold: 20, unit: 'tablet',  expiry: '2026-03' },
  { id: uuid(), name: 'Amoxicillin 250mg', category: 'Drugs',         price: 450,  stock: 88,  lowStockThreshold: 15, unit: 'capsule', expiry: '2026-08' },
  { id: uuid(), name: 'Vitamin C 1000mg',  category: 'Vitamins',      price: 800,  stock: 4,   lowStockThreshold: 10, unit: 'tablet',  expiry: '2026-01' },
  { id: uuid(), name: 'Ibuprofen 400mg',   category: 'Drugs',         price: 200,  stock: 180, lowStockThreshold: 20, unit: 'tablet',  expiry: '2026-11' },
  { id: uuid(), name: 'ORS Sachet',        category: 'Drugs',         price: 120,  stock: 310, lowStockThreshold: 30, unit: 'sachet',  expiry: '2026-06' },
  { id: uuid(), name: 'Disposable Gloves', category: 'Sundries',      price: 600,  stock: 6,   lowStockThreshold: 10, unit: 'box',     expiry: null },
  { id: uuid(), name: 'Metformin 500mg',   category: 'Drugs',         price: 350,  stock: 0,   lowStockThreshold: 15, unit: 'tablet',  expiry: '2026-04' },
  { id: uuid(), name: 'Hand Sanitiser',    category: 'Personal Care', price: 750,  stock: 34,  lowStockThreshold: 10, unit: 'bottle',  expiry: null },
  { id: uuid(), name: 'Omeprazole 20mg',   category: 'Drugs',         price: 300,  stock: 60,  lowStockThreshold: 10, unit: 'capsule', expiry: '2026-09' },
  { id: uuid(), name: 'Zinc Syrup 100ml',  category: 'Vitamins',      price: 550,  stock: 22,  lowStockThreshold: 8,  unit: 'bottle',  expiry: '2026-05' },
  { id: uuid(), name: 'Malt Drink',        category: 'Beverages',     price: 400,  stock: 48,  lowStockThreshold: 12, unit: 'can',     expiry: null },
  { id: uuid(), name: 'Glucose Powder',    category: 'Beverages',     price: 650,  stock: 17,  lowStockThreshold: 8,  unit: 'tin',     expiry: '2026-12' },
]

// ── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  // store info
  store: {
    name: 'SwiftPOS Store',
    type: 'pharmacy',    // 'pharmacy' | 'supermarket'
    currency: '₦',
    vatRate: 0.075,
    cashierName: 'Cashier',
  },
  // catalogue
  products: [],
  // active sale cart: { [productId]: { product, qty } }
  cart: {},
  // completed sales (today)
  sales: [],
  // ui
  activeCategory: 'All',
  searchQuery: '',
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function posReducer(state, action) {
  switch (action.type) {

    // ─ Products ─────────────────────────────────────────────────────────────
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }

    case 'ADD_PRODUCT': {
      const product = { id: uuid(), ...action.payload }
      return { ...state, products: [...state.products, product] }
    }

    case 'UPDATE_PRODUCT': {
      const products = state.products.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      )
      return { ...state, products }
    }

    case 'DELETE_PRODUCT': {
      const products = state.products.filter(p => p.id !== action.payload)
      // also remove from cart if present
      const cart = { ...state.cart }
      delete cart[action.payload]
      return { ...state, products, cart }
    }

    case 'RESTOCK_PRODUCT': {
      const products = state.products.map(p =>
        p.id === action.payload.id
          ? { ...p, stock: p.stock + action.payload.qty }
          : p
      )
      return { ...state, products }
    }

    // ─ Cart ─────────────────────────────────────────────────────────────────
    case 'ADD_TO_CART': {
      const product = state.products.find(p => p.id === action.payload)
      if (!product || product.stock === 0) return state
      const existing = state.cart[product.id]
      if (existing && existing.qty >= product.stock) return state  // respect stock
      return {
        ...state,
        cart: {
          ...state.cart,
          [product.id]: {
            product,
            qty: existing ? existing.qty + 1 : 1,
          },
        },
      }
    }

    case 'REMOVE_FROM_CART': {
      const existing = state.cart[action.payload]
      if (!existing) return state
      if (existing.qty <= 1) {
        const cart = { ...state.cart }
        delete cart[action.payload]
        return { ...state, cart }
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          [action.payload]: { ...existing, qty: existing.qty - 1 },
        },
      }
    }

    case 'SET_CART_QTY': {
      const existing = state.cart[action.payload.id]
      if (!existing) return state
      const qty = Math.max(0, Math.min(action.payload.qty, existing.product.stock))
      if (qty === 0) {
        const cart = { ...state.cart }
        delete cart[action.payload.id]
        return { ...state, cart }
      }
      return {
        ...state,
        cart: { ...state.cart, [action.payload.id]: { ...existing, qty } },
      }
    }

    case 'CLEAR_CART':
      return { ...state, cart: {} }

    // ─ Sales ────────────────────────────────────────────────────────────────
    case 'COMPLETE_SALE': {
      const { paymentMethod } = action.payload
      const items = Object.values(state.cart)
      if (!items.length) return state

      const subtotal  = items.reduce((s, i) => s + i.product.price * i.qty, 0)
      const vat       = Math.round(subtotal * state.store.vatRate)
      const total     = subtotal + vat
      const saleId    = uuid()

      const sale = {
        id: saleId,
        items: items.map(i => ({ ...i.product, qty: i.qty, lineTotal: i.product.price * i.qty })),
        subtotal,
        vat,
        total,
        paymentMethod,
        timestamp: new Date().toISOString(),
        receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
      }

      // deduct stock
      const products = state.products.map(p => {
        const cartItem = state.cart[p.id]
        return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p
      })

      return {
        ...state,
        products,
        cart: {},
        sales: [sale, ...state.sales],
      }
    }

    // ─ UI filters ────────────────────────────────────────────────────────────
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.payload }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }

    // ─ Store config ──────────────────────────────────────────────────────────
    case 'UPDATE_STORE':
      return { ...state, store: { ...state.store, ...action.payload } }

    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const POSContext = createContext(null)

export function POSProvider({ children }) {
  const [state, dispatch] = useReducer(posReducer, initialState)

  // ── localStorage persistence ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pos_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.products?.length) dispatch({ type: 'SET_PRODUCTS', payload: parsed.products })
      } else {
        // First launch — load seed data
        dispatch({ type: 'SET_PRODUCTS', payload: SEED_PRODUCTS })
      }
    } catch {
      dispatch({ type: 'SET_PRODUCTS', payload: SEED_PRODUCTS })
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('pos_state', JSON.stringify({ products: state.products, store: state.store }))
    } catch { /* storage full or unavailable */ }
  }, [state.products, state.store])

  // ── Derived / computed ───────────────────────────────────────────────────
  const cartItems    = Object.values(state.cart)
  const cartCount    = cartItems.reduce((s, i) => s + i.qty, 0)
  const subtotal     = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0)
  const vat          = Math.round(subtotal * state.store.vatRate)
  const cartTotal    = subtotal + vat

  const lowStockItems   = state.products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold)
  const outOfStockItems = state.products.filter(p => p.stock === 0)

  const categories = ['All', ...new Set(state.products.map(p => p.category))]

  const filteredProducts = state.products.filter(p => {
    const matchCat   = state.activeCategory === 'All' || p.category === state.activeCategory
    const matchSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const todaySales = state.sales.filter(s => {
    const saleDate = new Date(s.timestamp).toDateString()
    return saleDate === new Date().toDateString()
  })
  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0)

  return (
    <POSContext.Provider value={{
      state,
      dispatch,
      // cart
      cartItems,
      cartCount,
      subtotal,
      vat,
      cartTotal,
      // products
      filteredProducts,
      categories,
      lowStockItems,
      outOfStockItems,
      // sales
      todaySales,
      todayRevenue,
    }}>
      {children}
    </POSContext.Provider>
  )
}

export const usePOS = () => {
  const ctx = useContext(POSContext)
  if (!ctx) throw new Error('usePOS must be used within POSProvider')
  return ctx
}
