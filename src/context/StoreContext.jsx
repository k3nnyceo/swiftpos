import { createContext, useContext, useReducer, useEffect } from 'react';
import { seedProducts } from '../data/seedProducts';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  products: JSON.parse(localStorage.getItem('pos_products')) || seedProducts,
  cart: [],                     // [{ product, qty }]
  sales: JSON.parse(localStorage.getItem('pos_sales')) || [],  // completed transactions
  storeInfo: JSON.parse(localStorage.getItem('pos_store')) || {
    name: 'My Store',
    type: 'pharmacy',           // 'pharmacy' | 'supermarket'
    cashierName: 'Cashier',
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    // CART
    case 'CART_ADD': {
      const existing = state.cart.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.product.id === action.product.id
              ? { ...i, qty: i.qty + 1 }
              : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product: action.product, qty: 1 }] };
    }

    case 'CART_REMOVE':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.id) };

    case 'CART_UPDATE_QTY': {
      if (action.qty <= 0) {
        return { ...state, cart: state.cart.filter(i => i.product.id !== action.id) };
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.product.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };
    }

    case 'CART_CLEAR':
      return { ...state, cart: [] };

    // CHECKOUT — deduct stock, record sale
    case 'CHECKOUT': {
      const { paymentMethod, amountPaid } = action;
      const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
      const vat      = Math.round(subtotal * 0.075);
      const total    = subtotal + vat;

      const sale = {
        id:            `TXN-${Date.now()}`,
        date:          new Date().toISOString(),
        items:         state.cart.map(i => ({ ...i })),
        subtotal,
        vat,
        total,
        paymentMethod,
        amountPaid,
        change:        amountPaid - total,
        cashier:       state.storeInfo.cashierName,
      };

      // Deduct stock
      const updatedProducts = state.products.map(p => {
        const cartItem = state.cart.find(i => i.product.id === p.id);
        if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
        return p;
      });

      return {
        ...state,
        cart:     [],
        sales:    [sale, ...state.sales],
        products: updatedProducts,
      };
    }

    // PRODUCTS
    case 'PRODUCT_ADD':
      return { ...state, products: [...state.products, action.product] };

    case 'PRODUCT_UPDATE':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.product.id ? action.product : p
        ),
      };

    case 'PRODUCT_DELETE':
      return { ...state, products: state.products.filter(p => p.id !== action.id) };

    case 'PRODUCT_RESTOCK':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.id ? { ...p, stock: p.stock + action.qty } : p
        ),
      };

    // STORE INFO
    case 'UPDATE_STORE_INFO':
      return { ...state, storeInfo: { ...state.storeInfo, ...action.info } };

    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage on every state change (offline support)
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(state.products));
  }, [state.products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(state.sales));
  }, [state.sales]);

  useEffect(() => {
    localStorage.setItem('pos_store', JSON.stringify(state.storeInfo));
  }, [state.storeInfo]);

  // ── Derived helpers ──────────────────────────────────────────────────────
  const cartTotal    = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartVat      = Math.round(cartTotal * 0.075);
  const cartGrand    = cartTotal + cartVat;
  const cartCount    = state.cart.reduce((s, i) => s + i.qty, 0);
  const lowStockItems = state.products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock    = state.products.filter(p => p.stock === 0);

  // Today's sales
  const today       = new Date().toDateString();
  const todaySales  = state.sales.filter(s => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((s, sale) => s + sale.total, 0);

  return (
    <StoreContext.Provider value={{
      ...state,
      dispatch,
      cartTotal,
      cartVat,
      cartGrand,
      cartCount,
      lowStockItems,
      outOfStock,
      todaySales,
      todayRevenue,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
