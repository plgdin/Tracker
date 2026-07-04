// ============================================================
// Ledger Management System — Data Layer (Supabase + localStorage)
// ============================================================
import { dbSupabase, getUseSupabase, withTimeout } from './db';

export type PurchasePaymentMethod = 'cash' | 'cheque';
export type SalePaymentMethod = 'cash' | 'upi';

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
  brands: 'ledger_brand_names',
};

// ── Derived helpers ───────────────────────────────────────────
export const getLedgerBrands = async (): Promise<string[]> => {
  const useSupabase = await getUseSupabase();
  let fromDb: string[] = [];
  if (useSupabase && dbSupabase) {
    try {
      const { data } = await withTimeout(dbSupabase.from('ledger_brands').select('name'));
      if (data) fromDb = data.map(d => d.name);
    } catch (e) { console.warn('Supabase brands error', e); }
  }
  
  const stored = getLocal<string[]>(KEYS.brands, []);
  const all = [...stored, ...fromDb];
  const seen = new Map<string, string>();
  all.forEach(b => { const k = b.toLowerCase(); if (!seen.has(k)) seen.set(k, b); });
  return Array.from(seen.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

export const saveLedgerBrand = async (name: string): Promise<void> => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const list = getLocal<string[]>(KEYS.brands, []);
  if (!list.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
    list.push(trimmed);
    setLocal(KEYS.brands, list);
  }
  const useSupabase = await getUseSupabase();
  if (useSupabase && dbSupabase) {
    try {
      await withTimeout(dbSupabase.from('ledger_brands').insert([{ name: trimmed }]).select());
    } catch { /* ignore dups */ }
  }
};

export const getLedgerCustomerNames = async (): Promise<string[]> => {
  const s = await ledgerDb.getSales();
  return [...new Set(s.map(x => x.customer_name))].sort();
};

// ── Main DB ───────────────────────────────────────────────────
export const ledgerDb = {

  // PURCHASES ------------------------------------------------
  async getPurchases(): Promise<PurchaseInvoice[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('ledger_purchase_invoices').select('*, ledger_purchase_items(*)')
        );
        if (error) throw error;
        if (data) {
          const res = data.map(d => ({ ...d, items: d.ledger_purchase_items })) as PurchaseInvoice[];
          const sorted = res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setLocal(KEYS.purchases, sorted);
          return sorted;
        }
      } catch (e) { console.warn('Supabase getPurchases error', e); }
    }
    return getLocal<PurchaseInvoice[]>(KEYS.purchases, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getPurchaseById(id: string): Promise<PurchaseInvoice | undefined> {
    const list = await this.getPurchases();
    return list.find(p => p.id === id);
  },

  async addPurchase(data: Omit<PurchaseInvoice, 'id' | 'created_at'>): Promise<PurchaseInvoice> {
    const useSupabase = await getUseSupabase();
    const id = genId();
    const created_at = new Date().toISOString();
    
    if (useSupabase && dbSupabase) {
      try {
        const { items, ...invoiceData } = data;
        const { data: invData, error: invError } = await withTimeout(
          dbSupabase.from('ledger_purchase_invoices').insert([invoiceData]).select().single()
        );
        if (invError) throw invError;
        if (invData) {
          const dbItems = items.map(i => ({
            item_name: i.item_name,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            invoice_id: invData.id,
          }));
          const { error: itemsError } = await withTimeout(dbSupabase.from('ledger_purchase_items').insert(dbItems));
          if (itemsError) throw itemsError;
        }
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        console.warn('Supabase addPurchase error:', err?.message || err);
        if (err?.code === '23505' || err?.message?.includes('duplicate key') || err?.message?.includes('already exists')) {
          throw new Error(`Invoice "${data.invoice_number}" already exists.`, { cause: e });
        }
        // Fall through to localStorage on all other errors (e.g. table missing)
      }
    }

    const list = getLocal<PurchaseInvoice[]>(KEYS.purchases, []);
    const record: PurchaseInvoice = { ...data, id, created_at };
    list.unshift(record);
    setLocal(KEYS.purchases, list);
    await saveLedgerBrand(data.brand_name);
    data.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    return record;
  },

  async updatePurchase(id: string, data: Partial<Omit<PurchaseInvoice, 'id' | 'created_at'>>): Promise<PurchaseInvoice> {
    const list = await this.getPurchases();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Purchase not found');
    const old = list[idx];

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { items, ...invoiceData } = data;
        if (Object.keys(invoiceData).length > 0) {
          await withTimeout(dbSupabase.from('ledger_purchase_invoices').update(invoiceData).eq('id', id));
        }
        if (items) {
          await withTimeout(dbSupabase.from('ledger_purchase_items').delete().eq('invoice_id', id));
          const dbItems = items.map(i => ({
            item_name: i.item_name,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            invoice_id: id,
          }));
          const { error: itemsError } = await withTimeout(dbSupabase.from('ledger_purchase_items').insert(dbItems));
          if (itemsError) throw itemsError;
        }
      } catch (e: unknown) {
        console.warn('Supabase updatePurchase error', (e as Error)?.message || e);
        // Fall through to localStorage on Supabase errors
      }
    }

    old.items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    const updated = { ...old, ...data };
    list[idx] = updated as PurchaseInvoice;
    setLocal(KEYS.purchases, list);
    list[idx].items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    if (data.brand_name) await saveLedgerBrand(data.brand_name);
    return list[idx];
  },

  async deletePurchase(id: string): Promise<void> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        await withTimeout(dbSupabase.from('ledger_purchase_invoices').delete().eq('id', id));
      } catch (e) { console.warn('Supabase deletePurchase error', e); }
    }
    const list = getLocal<PurchaseInvoice[]>(KEYS.purchases, []);
    const p = list.find(x => x.id === id);
    if (p) p.items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    setLocal(KEYS.purchases, list.filter(x => x.id !== id));
  },

  // SALES ----------------------------------------------------
  async getSales(): Promise<SalesInvoice[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(
          dbSupabase.from('ledger_sales_invoices').select('*, ledger_sales_items(*)')
        );
        if (error) throw error;
        if (data) {
          const res = data.map(d => ({ ...d, items: d.ledger_sales_items })) as SalesInvoice[];
          const sorted = res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setLocal(KEYS.sales, sorted);
          return sorted;
        }
      } catch (e) { console.warn('Supabase getSales error', e); }
    }
    return getLocal<SalesInvoice[]>(KEYS.sales, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getSaleById(id: string): Promise<SalesInvoice | undefined> {
    const list = await this.getSales();
    return list.find(s => s.id === id);
  },

  async addSale(data: Omit<SalesInvoice, 'id' | 'created_at'>): Promise<SalesInvoice> {
    const useSupabase = await getUseSupabase();
    const id = genId();
    const created_at = new Date().toISOString();

    if (useSupabase && dbSupabase) {
      try {
        const invoiceData = { ...data } as Record<string, unknown>;
        delete invoiceData.items;
        delete invoiceData.balance_due;
        const { data: invData, error: invError } = await withTimeout(
          dbSupabase.from('ledger_sales_invoices').insert([invoiceData]).select().single()
        );
        if (invError) throw invError;
        if (invData) {
          const dbItems = data.items.map(i => ({
            item_name: i.item_name,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            invoice_id: invData.id,
          }));
          const { error: itemsError } = await withTimeout(dbSupabase.from('ledger_sales_items').insert(dbItems));
          if (itemsError) throw itemsError;
        }
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        console.warn('Supabase addSale error:', err?.message || err);
        if (err?.code === '23505' || err?.message?.includes('duplicate key') || err?.message?.includes('already exists')) {
          throw new Error(`Invoice "${data.invoice_number}" already exists.`, { cause: e });
        }
        // Fall through to localStorage on all other errors (e.g. table missing)
      }
    }

    const list = getLocal<SalesInvoice[]>(KEYS.sales, []);
    const record: SalesInvoice = { ...data, id, created_at };
    list.unshift(record);
    setLocal(KEYS.sales, list);
    await this._upsertCustomer(data.customer_name, data.customer_phone, data.balance_due, data.sale_date);
    data.items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    return record;
  },

  async updateSale(id: string, data: Partial<Omit<SalesInvoice, 'id' | 'created_at'>>): Promise<SalesInvoice> {
    const list = await this.getSales();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sale not found');
    const old = list[idx];

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const invoiceData = { ...data } as Record<string, unknown>;
        delete invoiceData.items;
        delete invoiceData.balance_due;
        if (Object.keys(invoiceData).length > 0) {
          await withTimeout(dbSupabase.from('ledger_sales_invoices').update(invoiceData).eq('id', id));
        }
        if (data.items) {
          await withTimeout(dbSupabase.from('ledger_sales_items').delete().eq('invoice_id', id));
          const dbItems = data.items.map(i => ({
            item_name: i.item_name,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            invoice_id: id,
          }));
          const { error: itemsError } = await withTimeout(dbSupabase.from('ledger_sales_items').insert(dbItems));
          if (itemsError) throw itemsError;
        }
      } catch (e: unknown) {
        console.warn('Supabase updateSale error', (e as Error)?.message || e);
        // Fall through to localStorage on Supabase errors
      }
    }

    old.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
    await this._adjustCustomerBalance(old.customer_name, -old.balance_due);
    const updated = { ...old, ...data };
    list[idx] = updated as SalesInvoice;
    setLocal(KEYS.sales, list);
    list[idx].items.forEach(i => this._adjustStock(i.item_name, -i.quantity));
    await this._adjustCustomerBalance(list[idx].customer_name, list[idx].balance_due);
    return list[idx];
  },

  async deleteSale(id: string): Promise<void> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        await withTimeout(dbSupabase.from('ledger_sales_invoices').delete().eq('id', id));
      } catch (e) { console.warn('Supabase deleteSale error', e); }
    }
    const list = getLocal<SalesInvoice[]>(KEYS.sales, []);
    const s = list.find(x => x.id === id);
    if (s) {
      s.items.forEach(i => this._adjustStock(i.item_name, i.quantity));
      await this._adjustCustomerBalance(s.customer_name, -s.balance_due);
    }
    setLocal(KEYS.sales, list.filter(x => x.id !== id));
  },

  // CUSTOMERS ------------------------------------------------
  async getCustomers(): Promise<Customer[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(dbSupabase.from('ledger_customers').select('*'));
        if (error) throw error;
        if (data) {
          const sorted = data.sort((a, b) => b.outstanding_balance - a.outstanding_balance);
          setLocal(KEYS.customers, sorted);
          return sorted as Customer[];
        }
      } catch (e) { console.warn('Supabase getCustomers error', e); }
    }
    return getLocal<Customer[]>(KEYS.customers, [])
      .sort((a, b) => b.outstanding_balance - a.outstanding_balance);
  },

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    const list = await this.getCustomers();
    return list.find(c => c.name.toLowerCase() === name.toLowerCase());
  },

  async _upsertCustomer(name: string, phone: string, balanceDelta: number, purchaseDate?: string): Promise<void> {
    const list = getLocal<Customer[]>(KEYS.customers, []);
    const idx = list.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    
    let newBalance = Math.max(0, r2(balanceDelta));
    if (idx !== -1) {
      newBalance = Math.max(0, r2(list[idx].outstanding_balance + balanceDelta));
      list[idx].outstanding_balance = newBalance;
      if (phone) list[idx].phone = phone;
      if (purchaseDate) list[idx].last_purchase_date = purchaseDate;
    } else {
      list.push({ id: genId(), name, phone, outstanding_balance: newBalance, last_purchase_date: purchaseDate, created_at: new Date().toISOString() });
    }
    setLocal(KEYS.customers, list);

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data: existing } = await withTimeout(dbSupabase.from('ledger_customers').select('id, outstanding_balance').ilike('name', name).maybeSingle());
        if (existing) {
          await withTimeout(dbSupabase.from('ledger_customers').update({ 
            outstanding_balance: Math.max(0, r2(existing.outstanding_balance + balanceDelta)),
            ...(phone ? { phone } : {}),
            ...(purchaseDate ? { last_purchase_date: purchaseDate } : {})
          }).eq('id', existing.id));
        } else {
          await withTimeout(dbSupabase.from('ledger_customers').insert([{ name, phone, outstanding_balance: newBalance, last_purchase_date: purchaseDate }]));
        }
      } catch (e) { console.warn('Supabase upsertCustomer error', e); }
    }
  },

  async _adjustCustomerBalance(name: string, delta: number): Promise<void> {
    await this._upsertCustomer(name, '', delta);
  },

  // PAYMENTS -------------------------------------------------
  async getPayments(): Promise<LedgerPayment[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(dbSupabase.from('ledger_payments').select('*'));
        if (error) throw error;
        if (data) {
          const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setLocal(KEYS.payments, sorted);
          return sorted as LedgerPayment[];
        }
      } catch (e) { console.warn('Supabase getPayments error', e); }
    }
    return getLocal<LedgerPayment[]>(KEYS.payments, [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addPayment(data: Omit<LedgerPayment, 'id' | 'created_at'>): Promise<LedgerPayment> {
    const useSupabase = await getUseSupabase();
    const id = genId();
    const created_at = new Date().toISOString();
    
    if (useSupabase && dbSupabase) {
      try {
        await withTimeout(dbSupabase.from('ledger_payments').insert([data]));
      } catch (e) { console.warn('Supabase addPayment error', e); }
    }

    const record: LedgerPayment = { ...data, id, created_at };
    const list = getLocal<LedgerPayment[]>(KEYS.payments, []);
    list.unshift(record);
    setLocal(KEYS.payments, list);
    await this._adjustCustomerBalance(data.customer_name, -data.amount);
    return record;
  },

  // INVENTORY ------------------------------------------------
  async getInventory(): Promise<InventoryStock[]> {
    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data, error } = await withTimeout(dbSupabase.from('ledger_inventory').select('*'));
        if (error) throw error;
        if (data) {
          const sorted = data.sort((a, b) => a.stock - b.stock);
          setLocal(KEYS.inventory, sorted);
          return sorted as InventoryStock[];
        }
      } catch (e) { console.warn('Supabase getInventory error', e); }
    }
    return getLocal<InventoryStock[]>(KEYS.inventory, []).sort((a, b) => a.stock - b.stock);
  },

  async _adjustStock(itemName: string, delta: number): Promise<void> {
    const list = getLocal<InventoryStock[]>(KEYS.inventory, []);
    const idx = list.findIndex(i => i.item_name.toLowerCase() === itemName.toLowerCase());
    let newStock = r2(delta);
    if (idx !== -1) {
      newStock = Math.max(0, r2(list[idx].stock + delta));
      list[idx].stock = newStock;
      list[idx].last_updated = new Date().toISOString();
    } else if (delta > 0) {
      list.push({ item_name: itemName, stock: newStock, last_updated: new Date().toISOString() });
    }
    setLocal(KEYS.inventory, list);

    const useSupabase = await getUseSupabase();
    if (useSupabase && dbSupabase) {
      try {
        const { data: existing } = await withTimeout(dbSupabase.from('ledger_inventory').select('stock').ilike('item_name', itemName).maybeSingle());
        if (existing) {
          await withTimeout(dbSupabase.from('ledger_inventory').update({ stock: Math.max(0, r2(existing.stock + delta)), last_updated: new Date().toISOString() }).ilike('item_name', itemName));
        } else if (delta > 0) {
          await withTimeout(dbSupabase.from('ledger_inventory').insert([{ item_name: itemName, stock: newStock }]));
        }
      } catch (e) { console.warn('Supabase adjustStock error', e); }
    }
  },

  async getStockForItem(name: string): Promise<number> {
    const inv = await this.getInventory();
    return inv.find(i => i.item_name.toLowerCase() === name.toLowerCase())?.stock ?? 0;
  },

  // STATS ----------------------------------------------------
  async getPurchaseStats() {
    const purchases = await this.getPurchases();
    const now = new Date();
    const thisMonth = purchases.filter(p => { const d = new Date(p.purchase_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const cheques = purchases.filter(p => p.payment_method === 'cheque');
    const brandTotals = purchases.reduce((acc: Record<string, number>, p) => { acc[p.brand_name] = r2((acc[p.brand_name] || 0) + p.total_amount); return acc; }, {} as Record<string, number>);
    const topBrands = (Object.entries(brandTotals) as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, 5);
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

  async getSalesStats() {
    const sales = await this.getSales();
    const now = new Date();
    const thisMonth = sales.filter(s => { const d = new Date(s.sale_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const customers = await this.getCustomers();
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
  async getFilteredPurchases(from: string, to: string): Promise<PurchaseInvoice[]> {
    const p = await this.getPurchases();
    return p.filter(x => x.purchase_date >= from && x.purchase_date <= to);
  },

  async getFilteredSales(from: string, to: string): Promise<SalesInvoice[]> {
    const s = await this.getSales();
    return s.filter(x => x.sale_date >= from && x.sale_date <= to);
  },
};
