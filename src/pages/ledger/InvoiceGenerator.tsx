import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, FileText, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { ledgerDb, r2, parseAmt, type SalesItem, type Customer } from '../../lib/ledgerDb';
import { db, type Item as InventoryItem } from '../../lib/db';
import { useToastStore } from '../../store/toastStore';

const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const todayStr = () => new Date().toISOString().split('T')[0];
const newRow = (): SalesItem => ({ id: Math.random().toString(36).slice(2), item_name: '', quantity: 1, unit_price: 0, tax_percentage: 0, total: 0 });

export default function InvoiceGenerator() {
  const showToast = useToastStore(s => s.showToast);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const blank = () => ({
    invoice_number: `INV-GEN-${Date.now().toString().slice(-4)}`,
    sale_date: todayStr(),
    customer_name: '',
    customer_phone: '',
    items: [newRow()],
    notes: '',
  });
  
  const [form, setForm] = useState(blank());
  
  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  useEffect(() => {
    ledgerDb.getCustomers().then(setCustomers);
    db.getItems().then(setInventoryItems);
  }, []);

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const updateItem = (idx: number, k: string, v: string) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [k]: v } as SalesItem;
      
      // Auto-fill tax percentage when item is selected
      if (k === 'item_name') {
        const matched = inventoryItems.find(inv => inv.name.toLowerCase() === v.toLowerCase());
        if (matched && matched.tax_percentage !== undefined) {
          items[idx].tax_percentage = matched.tax_percentage;
        }
      }
      
      if (k === 'quantity' || k === 'unit_price') {
        items[idx].total = r2(parseAmt(items[idx].quantity) * parseAmt(items[idx].unit_price));
      }
      return { ...f, items };
    });
  };

  // Calculations
  const prevBalance = form.customer_name ? (customers.find(c => c.name.toLowerCase() === form.customer_name.toLowerCase())?.outstanding_balance ?? 0) : 0;
  
  const itemsTotalBase = r2(form.items.reduce((s, i) => s + r2(parseAmt(i.quantity) * parseAmt(i.unit_price)), 0));
  
  const totalTaxAmount = r2(form.items.reduce((s, i) => {
    const base = parseAmt(i.quantity) * parseAmt(i.unit_price);
    const taxRate = parseAmt(i.tax_percentage);
    return s + r2(base * (taxRate / 100));
  }, 0));
  
  const sgstAmount = r2(totalTaxAmount / 2);
  const cgstAmount = r2(totalTaxAmount / 2);
  
  const grandTotal = r2(itemsTotalBase + totalTaxAmount + prevBalance);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_number.trim() || !form.customer_name.trim()) {
      showToast('Fill required fields');
      return;
    }
    if (form.items.some(i => !i.item_name.trim())) {
      showToast('Each item needs a name');
      return;
    }
    
    setSaving(true);
    try {
      const items = form.items.map(i => ({
        ...i,
        quantity: parseAmt(i.quantity),
        unit_price: parseAmt(i.unit_price),
        total: r2(parseAmt(i.quantity) * parseAmt(i.unit_price))
      }));
      
      const payload = {
        invoice_number: form.invoice_number.trim(),
        sale_date: form.sale_date,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        previous_balance: prevBalance,
        payment_method: 'cash' as const, // Default for generated invoices
        notes: form.notes || undefined,
        items,
        tax_percentage: undefined, // removed global tax percentage
        sgst_amount: sgstAmount,
        cgst_amount: cgstAmount,
        total_amount: grandTotal,
        amount_paid: 0, // Assume unpaid initially
        balance_due: grandTotal,
      };
      
      const saved = await ledgerDb.addSale(payload);
      showToast('Invoice Generated ✅');
      
      // Show confirmation modal
      setConfirmedOrder({
        ...saved,
        itemsTotalBase,
      });
      
    } catch (err: unknown) {
      showToast('❌ ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(blank());
    setConfirmedOrder(null);
  };
  
  const generateTextMessage = (order: any) => {
    let msg = `*Order Confirmation - ${order.invoice_number}*\n`;
    msg += `Date: ${order.sale_date}\n`;
    msg += `Customer: ${order.customer_name}\n\n`;
    msg += `*Items:*\n`;
    order.items.forEach((i: any) => {
      msg += `- ${i.item_name} x ${i.quantity} @ ${fmt(i.unit_price)} = ${fmt(i.total)}\n`;
    });
    msg += `\nSubtotal: ${fmt(order.itemsTotalBase)}\n`;
    if (order.sgst_amount > 0 || order.cgst_amount > 0) {
      msg += `Total SGST: ${fmt(order.sgst_amount)}\n`;
      msg += `Total CGST: ${fmt(order.cgst_amount)}\n`;
    }
    if (order.previous_balance > 0) {
      msg += `Previous Balance: ${fmt(order.previous_balance)}\n`;
    }
    msg += `\n*Grand Total: ${fmt(order.total_amount)}*`;
    return msg;
  };

  if (confirmedOrder) {
    const textMsg = generateTextMessage(confirmedOrder);
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <CheckCircle size={48} style={{ color: 'var(--color-success)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Invoice Confirmed!</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            The invoice has been successfully generated and saved to the ledger.
          </p>
          
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} /> Text Message Summary
            </h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--color-text-primary)', margin: 0 }}>
              {textMsg}
            </pre>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => {
                navigator.clipboard.writeText(textMsg);
                showToast('Copied to clipboard! 📋');
              }}>
              <Copy size={16} /> Copy Text Message
            </button>
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleReset}>
              <RefreshCw size={16} /> Create New Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Invoice Generator</h2>
          <p className="ledger-muted" style={{ margin: 0 }}>Create a new invoice with tax calculations</p>
        </div>
      </div>

      <form onSubmit={handleConfirm}>
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 className="ledger-section-title">Invoice Details</h3>
          <div className="ledger-form-grid">
            <div className="input-group">
              <label className="input-label">Invoice Number *</label>
              <input className="input-field" value={form.invoice_number} onChange={e => setF('invoice_number', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Date *</label>
              <input type="date" className="input-field" value={form.sale_date} onChange={e => setF('sale_date', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Customer Name *</label>
              <input className="input-field" value={form.customer_name} onChange={e => setF('customer_name', e.target.value)} placeholder="Customer name" required />
            </div>
            <div className="input-group">
              <label className="input-label">Customer Phone</label>
              <input className="input-field" value={form.customer_phone} onChange={e => setF('customer_phone', e.target.value)} placeholder="Phone number" inputMode="tel" />
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <h3 className="ledger-section-title" style={{ margin: 0 }}>Items</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>Only base product prices are shown here.</p>
            </div>
            <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setForm(f => ({ ...f, items: [...f.items, newRow()] }))}>
              <Plus size={13} /> Add Row
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Base Price (₹)</th>
                  <th>Tax %</th>
                  <th>Base Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>
                      <input 
                        className="input-field" 
                        style={{ minWidth: '150px' }} 
                        value={item.item_name} 
                        onChange={e => updateItem(idx, 'item_name', e.target.value)} 
                        placeholder="Item name" 
                        list="inventory-items"
                        required 
                      />
                    </td>
                    <td>
                      <input type="text" inputMode="decimal" className="input-field" style={{ width: '80px' }} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" inputMode="decimal" className="input-field" style={{ width: '100px' }} value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="input-field" style={{ width: '80px' }} value={item.tax_percentage || 0} onChange={e => updateItem(idx, 'tax_percentage', e.target.value)} min="0" max="100" />
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmt(r2(parseAmt(item.quantity) * parseAmt(item.unit_price)))}</td>
                    <td>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <datalist id="inventory-items">
              {inventoryItems.map(item => (
                <option key={item.id} value={item.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1rem', background: '#F8FAFC' }}>
          <h3 className="ledger-section-title">Final Invoice Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '10px', fontSize: '0.85rem', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} /> Tax is now calculated individually per item.
            </div>
            
            {prevBalance > 0 && (
              <div style={{ padding: '0.75rem', background: '#FEF3C7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> Previous Balance: <strong>{fmt(prevBalance)}</strong>
              </div>
            )}
          </div>
          
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span className="ledger-muted">Subtotal (Base Price)</span>
              <span>{fmt(itemsTotalBase)}</span>
            </div>
            
            {totalTaxAmount > 0 && (
              <>
                <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="ledger-muted">Total SGST</span>
                  <span>{fmt(sgstAmount)}</span>
                </div>
                <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="ledger-muted">Total CGST</span>
                  <span>{fmt(cgstAmount)}</span>
                </div>
              </>
            )}
            
            {prevBalance > 0 && (
              <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span className="ledger-muted">Previous Balance</span>
                <span>{fmt(prevBalance)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', width: '300px', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
              <span>Grand Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }} disabled={saving}>
            {saving ? 'Generating...' : 'Confirm Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
