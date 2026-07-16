// Sample products for both pharmacy and supermarket
// In production these come from the database
export const CATEGORIES = {
  pharmacy: ['Drugs', 'Vitamins', 'Personal Care', 'Sundries', 'Beverages'],
  supermarket: ['Food & Grocery', 'Beverages', 'Household', 'Personal Care', 'Snacks'],
};

export const seedProducts = [
  // Pharmacy items
  { id: 'p1', name: 'Paracetamol 500mg', category: 'Drugs',         price: 150,  stock: 240, lowStockThreshold: 20, sku: 'DRG-001', expiryDate: '2026-03-01' },
  { id: 'p2', name: 'Amoxicillin 250mg', category: 'Drugs',         price: 450,  stock: 88,  lowStockThreshold: 15, sku: 'DRG-002', expiryDate: '2026-08-15' },
  { id: 'p3', name: 'Vitamin C 1000mg',  category: 'Vitamins',      price: 800,  stock: 4,   lowStockThreshold: 10, sku: 'VIT-001', expiryDate: '2026-01-20' },
  { id: 'p4', name: 'Ibuprofen 400mg',   category: 'Drugs',         price: 200,  stock: 180, lowStockThreshold: 20, sku: 'DRG-003', expiryDate: '2026-11-01' },
  { id: 'p5', name: 'ORS Sachet',        category: 'Drugs',         price: 120,  stock: 310, lowStockThreshold: 30, sku: 'DRG-004', expiryDate: '2026-06-30' },
  { id: 'p6', name: 'Disposable Gloves', category: 'Sundries',      price: 600,  stock: 6,   lowStockThreshold: 10, sku: 'SND-001', expiryDate: null },
  { id: 'p7', name: 'Metformin 500mg',   category: 'Drugs',         price: 350,  stock: 0,   lowStockThreshold: 15, sku: 'DRG-005', expiryDate: '2026-04-01' },
  { id: 'p8', name: 'Hand Sanitiser 500ml', category: 'Personal Care', price: 750, stock: 34, lowStockThreshold: 10, sku: 'PER-001', expiryDate: null },
  // Supermarket items
  { id: 's1', name: 'Indomie Noodles (carton)', category: 'Food & Grocery', price: 7200, stock: 22, lowStockThreshold: 5, sku: 'FDG-001', expiryDate: '2026-09-01' },
  { id: 's2', name: 'Peak Milk 400g',           category: 'Food & Grocery', price: 2200, stock: 48, lowStockThreshold: 10, sku: 'FDG-002', expiryDate: '2026-07-01' },
  { id: 's3', name: 'Coca-Cola 50cl',           category: 'Beverages',      price: 400,  stock: 120, lowStockThreshold: 24, sku: 'BEV-001', expiryDate: '2026-12-01' },
  { id: 's4', name: 'Dettol Soap',              category: 'Personal Care',  price: 500,  stock: 3,  lowStockThreshold: 10, sku: 'PER-002', expiryDate: null },
  { id: 's5', name: 'Golden Morn 500g',         category: 'Food & Grocery', price: 1500, stock: 30, lowStockThreshold: 8,  sku: 'FDG-003', expiryDate: '2026-08-01' },
  { id: 's6', name: 'Omo Detergent 500g',       category: 'Household',      price: 900,  stock: 55, lowStockThreshold: 10, sku: 'HSH-001', expiryDate: null },
];
