// ============================================================
// Ledger Management System — Data Layer (localStorage-first)
// ============================================================

// Fix #1 & #2: Corrected payment method types
export type PurchasePaymentMethod = 'cash' | 'cheque';
export type SalePaymentMethod = 'cash' | 'upi';

// Fix #3: Decimal precision helper — use everywhere amounts are computed
export const r2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
export const parseAmt = (v: string | number): number => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

export interface PurchaseItem {
  id: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Fix #6: Removed supplier_name — only brand_name remains
export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  purchase_date: string;
  brand_name: string;
  items: PurchaseItem[];
  total_amount: number;
  payment_method: PurchasePaymentMethod;
  cheque_number?: string;
  cheque_date?: string;
  notes?: string;
  created_at: string;
}

export interface SalesItem {
  id: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  customer_phone: string;
  previous_balance: number;
  items: SalesItem[];
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  payment_method: SalePaymentMethod;
  notes?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  outstanding_balance: number;
  last_purchase_date?: string;
  created_at: string;
}

export interface LedgerPayment {
  id: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_method: SalePaymentMethod;
  notes?: string;
  created_at: string;
}

export interface InventoryStock {
  item_name: string;
  stock: number;
  last_updated: string;
}

// ── Helpers ──────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const getLocal = <T>(key: string, def: T): T => {
  try {
    const d = localStorage.getItem(key);
    return d ? (JSON.parse(d) as T) : def;
  } catch { return def; }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const KEYS = {
  purchases: 'ledger_purchases',
  sales: 'ledger_sales',
  customers: 'ledger_customers',
  payments: 'ledger_payments',
  inventory: 'ledger_inventory',
  brands: 'ledger_brand_names',  // Fix #7: persistent brand list
};

// ── Derived helpers ───────────────────────────────────────────
// Fix #7: Brand autocomplete — merge stored list + purchase history, case-dedup
export const getLedgerBrands = (): string[] => {
  const stored = getLocal<string[]>(KEYS.brands, []);
  const fromPurchases = getLocal<PurchaseInvoice[]>(KEYS.purchases, []).map(p => p.brand_name);
  const all = [...stored, ...fromPurchases];
  // Deduplicate case-insensitively, keep first casing encountered
  const seen = new Map<string, string>();
  all.forEach(b => { const k = b.toLowerCase(); if (!seen.has(k)) seen.set(k, b); });
  return Array.from(seen.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

export const saveLedgerBrand = (name: string): void => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const list = getLocal<string[]>(KEYS.brands, []);
  if (!list.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
    list.push(trimmed);
    setLocal(KEYS.brands, list);
  }
};

export const getLedgerCustomerNames = (): string[] => {
  const s = getLocal<SalesInvoice[]>(KEYS.sales, []);
  return [...new Set(s.map(x => x.customer_name))].sort();
};

// ── Main DB ───────────────────────────────────────────────────
export const ledgerDb = {

  // PURCHASES ------------------------------------------------
  getPurchases(): PurchaseInvoice[] {
    return getLocal<PurchaseInvoice[]>(KEYS.purchases, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getPurchaseById(id: string): PurchaseInvoice | undefined {
    return getLocal<PurchaseInvoice[]>(KEYS.purchases, []).find(p => p.id === id);
  },

  getPurchasesByBrand(brand: string): PurchaseInvoice[] {
    return this.getPurchases().filter(p => p.brand_name.toLowerCase() === brand.toLowerCase());
  },

  addPurchase(data: Omit<PurchaseInvoice, 'id' | 'created_at'>): PurchaseInvoice {
    const list = getLocal<PurchaseInvoice[]>(KEYS.purchases, []);
    if (list.some(p => p.invoice_number === data.invoice_number)) {
      throw new Error(`Invoice "${data.invoice_number}" already exists.`);
    }
    const record: PurchaseInvoice = { ...data, id: genId(), created_at: new Date().toISOString() };
    list.unshift(record);
    setLocal(KEYS.purchases, list);
    saveLedgerBrand(data.brand_name);  // Fix #7: auto-save brand
    data.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    return record;
  },

  updatePurchase(id: string, data: Partial<Omit<PurchaseInvoice, 'id' | 'created_at'>>): PurchaseInvoice {
    const list = getLocal<PurchaseInvoice[]>(KEYS.purchases, []);
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Purchase not found');
    if (data.invoice_number && list.some(p => p.invoice_number === data.invoice_number && p.id !== id)) {
      throw new Error(`Invoice "${data.invoice_number}" already exists.`);
    }
    list[idx].items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    list[idx] = { ...list[idx], ...data };
    setLocal(KEYS.purchases, list);
    list[idx].items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    if (data.brand_name) saveLedgerBrand(data.brand_name);
    return list[idx];
  },

  deletePurchase(id: string): void {
    const list = getLocal<PurchaseInvoice[]>(KEYS.purchases, []);
    const p = list.find(x => x.id === id);
    if (p) p.items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    setLocal(KEYS.purchases, list.filter(x => x.id !== id));
  },

  // SALES ----------------------------------------------------
  getSales(): SalesInvoice[] {
    return getLocal<SalesInvoice[]>(KEYS.sales, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getSaleById(id: string): SalesInvoice | undefined {
    return getLocal<SalesInvoice[]>(KEYS.sales, []).find(s => s.id === id);
  },

  getSalesByCustomer(name: string): SalesInvoice[] {
    return this.getSales().filter(s => s.customer_name.toLowerCase() === name.toLowerCase());
  },

  addSale(data: Omit<SalesInvoice, 'id' | 'created_at'>): SalesInvoice {
    const list = getLocal<SalesInvoice[]>(KEYS.sales, []);
    if (list.some(s => s.invoice_number === data.invoice_number)) {
      throw new Error(`Invoice "${data.invoice_number}" already exists.`);
    }
    const record: SalesInvoice = { ...data, id: genId(), created_at: new Date().toISOString() };
    list.unshift(record);
    setLocal(KEYS.sales, list);
    this._upsertCustomer(data.customer_name, data.customer_phone, data.balance_due, data.sale_date);
    data.items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    return record;
  },

  updateSale(id: string, data: Partial<Omit<SalesInvoice, 'id' | 'created_at'>>): SalesInvoice {
    const list = getLocal<SalesInvoice[]>(KEYS.sales, []);
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sale not found');
    if (data.invoice_number && list.some(s => s.invoice_number === data.invoice_number && s.id !== id)) {
      throw new Error(`Invoice "${data.invoice_number}" already exists.`);
    }
    const old = list[idx];
    old.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    this._adjustCustomerBalance(old.customer_name, -old.balance_due);
    list[idx] = { ...old, ...data };
    setLocal(KEYS.sales, list);
    list[idx].items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    this._adjustCustomerBalance(list[idx].customer_name, list[idx].balance_due);
    return list[idx];
  },

  deleteSale(id: string): void {
    const list = getLocal<SalesInvoice[]>(KEYS.sales, []);
    const s = list.find(x => x.id === id);
    if (s) {
      s.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
      this._adjustCustomerBalance(s.customer_name, -s.balance_due);
    }
    setLocal(KEYS.sales, list.filter(x => x.id !== id));
  },

  // CUSTOMERS ------------------------------------------------
  getCustomers(): Customer[] {
    return getLocal<Customer[]>(KEYS.customers, [])
      .sort((a, b) => b.outstanding_balance - a.outstanding_balance);
  },

  getCustomerByName(name: string): Customer | undefined {
    return getLocal<Customer[]>(KEYS.customers, [])
      .find(c => c.name.toLowerCase() === name.toLowerCase());
  },

  _upsertCustomer(name: string, phone: string, balanceDelta: number, purchaseDate?: string): void {
    const list = getLocal<Customer[]>(KEYS.customers, []);
    const idx = list.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    // Fix #3: use r2() for balance precision
    if (idx !== -1) {
      list[idx].outstanding_balance = Math.max(0, r2(list[idx].outstanding_balance + balanceDelta));
      if (phone) list[idx].phone = phone;
      if (purchaseDate) list[idx].last_purchase_date = purchaseDate;
    } else {
      list.push({ id: genId(), name, phone, outstanding_balance: Math.max(0, r2(balanceDelta)), last_purchase_date: purchaseDate, created_at: new Date().toISOString() });
    }
    setLocal(KEYS.customers, list);
  },

  _adjustCustomerBalance(name: string, delta: number): void {
    const list = getLocal<Customer[]>(KEYS.customers, []);
    const idx = list.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    if (idx !== -1) {
      list[idx].outstanding_balance = Math.max(0, r2(list[idx].outstanding_balance + delta));
      setLocal(KEYS.customers, list);
    }
  },

  // PAYMENTS -------------------------------------------------
  getPayments(): LedgerPayment[] {
    return getLocal<LedgerPayment[]>(KEYS.payments, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addPayment(data: Omit<LedgerPayment, 'id' | 'created_at'>): LedgerPayment {
    const record: LedgerPayment = { ...data, id: genId(), created_at: new Date().toISOString() };
    const list = getLocal<LedgerPayment[]>(KEYS.payments, []);
    list.unshift(record);
    setLocal(KEYS.payments, list);
    this._adjustCustomerBalance(data.customer_name, -data.amount);
    return record;
  },

  // INVENTORY ------------------------------------------------
  getInventory(): InventoryStock[] {
    return getLocal<InventoryStock[]>(KEYS.inventory, []).sort((a, b) => a.stock - b.stock);
  },

  _adjustStock(itemName: string, delta: number): void {
    const list = getLocal<InventoryStock[]>(KEYS.inventory, []);
    const idx = list.findIndex(i => i.item_name.toLowerCase() === itemName.toLowerCase());
    if (idx !== -1) {
      list[idx].stock = Math.max(0, r2(list[idx].stock + delta));
      list[idx].last_updated = new Date().toISOString();
    } else if (delta > 0) {
      list.push({ item_name: itemName, stock: r2(delta), last_updated: new Date().toISOString() });
    }
    setLocal(KEYS.inventory, list);
  },

  getStockForItem(name: string): number {
    return getLocal<InventoryStock[]>(KEYS.inventory, []).find(i => i.item_name.toLowerCase() === name.toLowerCase())?.stock ?? 0;
  },

  // STATS ----------------------------------------------------
  getPurchaseStats() {
    const purchases = this.getPurchases();
    const now = new Date();
    const thisMonth = purchases.filter(p => { const d = new Date(p.purchase_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const cheques = purchases.filter(p => p.payment_method === 'cheque');
    const brandTotals = purchases.reduce<Record<string, number>>((acc, p) => { acc[p.brand_name] = r2((acc[p.brand_name] || 0) + p.total_amount); return acc; }, {});
    const topBrands = Object.entries(brandTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      totalAmount: r2(purchases.reduce((s, p) => s + p.total_amount, 0)),
      totalCount: purchases.length,
      monthAmount: r2(thisMonth.reduce((s, p) => s + p.total_amount, 0)),
      monthCount: thisMonth.length,
      chequesCount: cheques.length,
      topBrands,
      recent: purchases.slice(0, 5),
    };
  },

  getSalesStats() {
    const sales = this.getSales();
    const now = new Date();
    const thisMonth = sales.filter(s => { const d = new Date(s.sale_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const customers = this.getCustomers();
    return {
      totalAmount: r2(sales.reduce((s, i) => s + i.total_amount, 0)),
      totalCount: sales.length,
      monthAmount: r2(thisMonth.reduce((s, i) => s + i.total_amount, 0)),
      monthCount: thisMonth.length,
      totalCollected: r2(sales.reduce((s, i) => s + i.amount_paid, 0)),
      totalOutstanding: r2(customers.reduce((s, c) => s + c.outstanding_balance, 0)),
      outstandingCount: customers.filter(c => c.outstanding_balance > 0).length,
      recent: sales.slice(0, 5),
    };
  },

  // REPORTS --------------------------------------------------
  getFilteredPurchases(from: string, to: string): PurchaseInvoice[] {
    return this.getPurchases().filter(p => p.purchase_date >= from && p.purchase_date <= to);
  },

  getFilteredSales(from: string, to: string): SalesInvoice[] {
    return this.getSales().filter(s => s.sale_date >= from && s.sale_date <= to);
  },
};
