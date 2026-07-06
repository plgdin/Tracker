import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Printer, ChevronRight, Package, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { ledgerDb, getLedgerBrands, saveLedgerBrand, r2, parseAmt, type PurchaseInvoice, type PurchaseItem, type PurchasePaymentMethod } from '../../../lib/ledgerDb';
import { printPurchaseInvoice } from '../../../lib/ledgerPrint';
import { useToastStore } from '../../../store/toastStore';

type View = 'dashboard' | 'brand-list' | 'brand-detail' | 'invoice-detail' | 'new' | 'edit';
const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const todayStr = () => new Date().toISOString().split('T')[0];
const newRow = (): PurchaseItem => ({ id: Math.random().toString(36).slice(2), item_name: '', quantity: 1, unit_price: 0, total: 0 });

// ── Fix #7: Brand Autocomplete Component ──────────────────────
function BrandAutocomplete({ value, onChange, brands }: { value: string; onChange: (v: string) => void; brands: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value.length > 0
    ? brands.filter(b => b.toLowerCase().includes(value.toLowerCase()) && b.toLowerCase() !== value.toLowerCase())
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        className="input-field"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Brand name"
        required
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1.5px solid rgba(230,57,70,0.2)', borderRadius: '10px', boxShadow: '0 8px 20px rgba(46,30,30,0.12)', zIndex: 999, maxHeight: '180px', overflowY: 'auto', marginTop: '3px' }}>
          {filtered.map(b => (
            <button key={b} type="button"
              onMouseDown={e => { e.preventDefault(); onChange(b); setOpen(false); }}
              style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text-primary)', transition: 'background 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {b}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PurchasingModule() {
  const navigate = useNavigate();
  const showToast = useToastStore(s => s.showToast);
  const [view, setView] = useState<View>('dashboard');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof ledgerDb.getPurchaseStats>>>({ totalAmount: 0, totalCount: 0, monthAmount: 0, monthCount: 0, chequesCount: 0, topBrands: [], recent: [] });
  const [saving, setSaving] = useState(false);

  // Fix #6: No supplier_name in blank form
  const blank = () => ({ invoice_number: '', purchase_date: todayStr(), brand_name: '', payment_method: 'cash' as PurchasePaymentMethod, cheque_number: '', cheque_date: '', notes: '', items: [newRow()] });
  const [form, setForm] = useState(blank());

  const refresh = async () => {
    const pData = await ledgerDb.getPurchases();
    const bData = await getLedgerBrands();
    const sData = await ledgerDb.getPurchaseStats();
    setPurchases(pData);
    setBrands(bData);
    setStats(sData);
  };
  useEffect(() => {
    let active = true;
    (async () => {
      const pData = await ledgerDb.getPurchases();
      const bData = await getLedgerBrands();
      const sData = await ledgerDb.getPurchaseStats();
      if (active) {
        setPurchases(pData);
        setBrands(bData);
        setStats(sData);
      }
    })();
    return () => { active = false; };
  }, []);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Fix #3: Proper decimal handling in item rows
  const updateItem = (idx: number, k: string, v: string) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [k]: v } as PurchaseItem;
      if (k === 'quantity' || k === 'unit_price') {
        items[idx].total = r2(parseAmt(items[idx].quantity) * parseAmt(items[idx].unit_price));
      }
      return { ...f, items };
    });
  };

  const grandTotal = r2(form.items.reduce((s, i) => s + r2(parseAmt(i.quantity) * parseAmt(i.unit_price)), 0));

  const openEdit = (inv: PurchaseInvoice) => {
    setEditId(inv.id);
    setForm({ invoice_number: inv.invoice_number, purchase_date: inv.purchase_date, brand_name: inv.brand_name, payment_method: inv.payment_method, cheque_number: inv.cheque_number || '', cheque_date: inv.cheque_date || '', notes: inv.notes || '', items: inv.items.map(i => ({ ...i })) });
    setView('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_number.trim() || !form.brand_name.trim()) { showToast('Fill required fields'); return; }
    if (form.items.some(i => !i.item_name.trim())) { showToast('Each item needs a name'); return; }
    setSaving(true);
    try {
      // Fix #7: Normalize brand name casing against existing brands
      const existingBrand = brands.find(b => b.toLowerCase() === form.brand_name.trim().toLowerCase());
      const brandName = existingBrand || form.brand_name.trim();
      // Fix #3: Ensure all amounts are properly rounded on save
      const items = form.items.map(i => ({ ...i, quantity: parseAmt(i.quantity), unit_price: parseAmt(i.unit_price), total: r2(parseAmt(i.quantity) * parseAmt(i.unit_price)) }));
      const payload = {
        invoice_number: form.invoice_number.trim(),
        purchase_date: form.purchase_date,
        brand_name: brandName,
        payment_method: form.payment_method,
        cheque_number: form.payment_method === 'cheque' ? (form.cheque_number || undefined) : undefined,
        cheque_date: form.payment_method === 'cheque' ? (form.cheque_date || undefined) : undefined,
        notes: form.notes || undefined,
        items,
        total_amount: r2(items.reduce((s, i) => s + i.total, 0)),
      };
      if (view === 'edit') { await ledgerDb.updatePurchase(editId, payload); showToast('Updated ✅'); }
      else { await ledgerDb.addPurchase(payload); showToast('Saved ✅'); }
      await saveLedgerBrand(brandName);
      refresh(); setView('dashboard');
    } catch (err: unknown) { showToast('❌ ' + (err instanceof Error ? err.message : 'Error')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this purchase? Inventory will be adjusted.')) return;
    await ledgerDb.deletePurchase(id); showToast('Deleted 🗑️'); refresh(); setView('dashboard');
  };

  const inv = purchases.find(p => p.id === selectedId);
  const brandInvoices = purchases.filter(p => p.brand_name.toLowerCase() === selectedBrand.toLowerCase());
  const filtered = search ? purchases.filter(p => p.invoice_number.toLowerCase().includes(search.toLowerCase()) || p.brand_name.toLowerCase().includes(search.toLowerCase())) : [];

  // ── DASHBOARD ───────────────────────────────────────────────
  if (view === 'dashboard') return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:0 }}>Purchasing</h2>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-outline" style={{ padding:'0.5rem 1rem', fontSize:'0.8rem' }} onClick={() => navigate('/admin/add-item')}><Plus size={15}/> Add Item</button>
          <button className="btn btn-primary" style={{ padding:'0.5rem 1rem', fontSize:'0.8rem' }} onClick={() => { setForm(blank()); setView('new'); }}><Plus size={15}/> New Purchase</button>
        </div>
      </div>
      <div className="ledger-stats-grid">
        {[{ label:'Total Purchases', value:fmt(stats.totalAmount), sub:`${stats.totalCount} invoices`, color:'var(--color-primary)' }, { label:'This Month', value:fmt(stats.monthAmount), sub:`${stats.monthCount} invoices`, color:'var(--color-accent)' }, { label:'Cheques Pending', value:String(stats.chequesCount), sub:'outstanding', color:'var(--color-warning)' }].map(s => (
          <div key={s.label} className="ledger-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
            <p className="ledger-stat-label">{s.label}</p>
            <p className="ledger-stat-value" style={{ color:s.color }}>{s.value}</p>
            <p className="ledger-stat-sub">{s.sub}</p>
          </div>
        ))}
      </div>
      <button className="ledger-nav-btn" style={{ marginBottom:'1rem' }} onClick={() => setView('brand-list')}><Package size={16}/> Browse by Brand</button>
      <input className="input-field" placeholder="🔍 Search invoices, brands…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:'0.75rem' }}/>
      {search && filtered.length > 0 && (
        <div className="panel" style={{ padding:'0.5rem', marginBottom:'1rem' }}>
          {filtered.map(p => (
            <button key={p.id} className="ledger-row-btn" onClick={() => { setSelectedId(p.id); setView('invoice-detail'); setSearch(''); }}>
              <div><strong>{p.invoice_number}</strong><span className="ledger-muted"> · {p.brand_name}</span></div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}><span>{fmt(p.total_amount)}</span><ChevronRight size={14}/></div>
            </button>
          ))}
        </div>
      )}
      {stats.topBrands.length > 0 && (
        <div className="panel" style={{ marginBottom:'1.25rem' }}>
          <h3 className="ledger-section-title"><TrendingUp size={16}/> Top Brands</h3>
          {stats.topBrands.map(([brand, amt]) => (
            <div key={brand} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:'1px solid rgba(230,57,70,0.06)' }}>
              <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{brand}</span>
              <span style={{ color:'var(--color-primary)', fontWeight:700, fontSize:'0.85rem' }}>{fmt(amt as number)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="panel">
        <h3 className="ledger-section-title"><FileText size={16}/> Recent Purchases</h3>
        {stats.recent.length === 0 ? <p style={{ color:'var(--color-text-secondary)', textAlign:'center', padding:'1.5rem', fontSize:'0.85rem' }}>No purchases yet.</p>
          : (stats.recent as PurchaseInvoice[]).map(p => (
            <button key={p.id} className="ledger-row-btn" onClick={() => { setSelectedId(p.id); setView('invoice-detail'); }}>
              <div><strong style={{ fontSize:'0.85rem' }}>{p.invoice_number}</strong><span className="ledger-muted"> · {p.brand_name}</span><div className="ledger-muted" style={{ fontSize:'0.72rem' }}>{p.purchase_date}</div></div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}><span style={{ color:'var(--color-primary)', fontWeight:700 }}>{fmt(p.total_amount)}</span><ChevronRight size={14}/></div>
            </button>
          ))}
      </div>
    </div>
  );

  // ── BRAND LIST ──────────────────────────────────────────────
  if (view === 'brand-list') return (
    <div>
      <button className="ledger-back-btn" onClick={() => setView('dashboard')}><ArrowLeft size={16}/> Back</button>
      <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:'0 0 1rem' }}>All Brands</h2>
      <div className="panel" style={{ padding:'0.5rem' }}>
        {brands.length === 0 ? <p style={{ color:'var(--color-text-secondary)', textAlign:'center', padding:'1.5rem' }}>No brands yet. Add a purchase to see brands.</p>
          : brands.map(brand => {
            const invs = purchases.filter(p => p.brand_name.toLowerCase() === brand.toLowerCase());
            const total = r2(invs.reduce((s, p) => s + p.total_amount, 0));
            return (
              <button key={brand} className="ledger-row-btn" onClick={() => { setSelectedBrand(brand); setView('brand-detail'); }}>
                <div><strong>{brand}</strong><div className="ledger-muted" style={{ fontSize:'0.75rem' }}>{invs.length} invoice{invs.length !== 1 ? 's' : ''}</div></div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}><span style={{ color:'var(--color-primary)', fontWeight:700 }}>{fmt(total)}</span><ChevronRight size={14}/></div>
              </button>
            );
          })}
      </div>
    </div>
  );

  // ── BRAND DETAIL ────────────────────────────────────────────
  if (view === 'brand-detail') return (
    <div>
      <button className="ledger-back-btn" onClick={() => setView('brand-list')}><ArrowLeft size={16}/> All Brands</button>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:0 }}>{selectedBrand}</h2>
        <button className="btn btn-primary" style={{ padding:'0.4rem 0.85rem', fontSize:'0.75rem' }} onClick={() => { setForm(blank()); setView('new'); }}><Plus size={14}/> New</button>
      </div>
      <div className="panel" style={{ padding:'0.5rem' }}>
        {brandInvoices.length === 0 ? <p style={{ color:'var(--color-text-secondary)', textAlign:'center', padding:'1.5rem' }}>No invoices.</p>
          : brandInvoices.map(p => (
            <button key={p.id} className="ledger-row-btn" onClick={() => { setSelectedId(p.id); setView('invoice-detail'); }}>
              <div><strong>{p.invoice_number}</strong><div className="ledger-muted" style={{ fontSize:'0.72rem' }}>{p.purchase_date}</div></div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}><span style={{ color:'var(--color-primary)', fontWeight:700 }}>{fmt(p.total_amount)}</span><ChevronRight size={14}/></div>
            </button>
          ))}
      </div>
    </div>
  );

  // ── INVOICE DETAIL ──────────────────────────────────────────
  if (view === 'invoice-detail' && inv) return (
    <div>
      <button className="ledger-back-btn" onClick={() => setView(selectedBrand ? 'brand-detail' : 'dashboard')}><ArrowLeft size={16}/> Back</button>
      <div className="panel" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem' }}>
          <div><h2 style={{ fontSize:'1.15rem', margin:'0 0 0.2rem' }}>Purchase Invoice</h2><p className="ledger-muted" style={{ margin:0 }}>#{inv.invoice_number}</p></div>
          <span className={`badge ${inv.payment_method === 'cheque' ? 'badge-warning' : 'badge-success'}`}>{inv.payment_method.toUpperCase()}</span>
        </div>
        <div className="ledger-info-grid">
          <div><span className="ledger-info-label">Date</span><span className="ledger-info-val">{inv.purchase_date}</span></div>
          <div><span className="ledger-info-label">Brand</span><span className="ledger-info-val">{inv.brand_name}</span></div>
          {inv.cheque_number && <div><span className="ledger-info-label">Cheque No.</span><span className="ledger-info-val">{inv.cheque_number}</span></div>}
          {inv.cheque_date && <div><span className="ledger-info-label">Cheque Date</span><span className="ledger-info-val">{inv.cheque_date}</span></div>}
        </div>
        <div className="ledger-table-container" style={{ marginTop:'1rem' }}>
          <table className="ledger-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>{inv.items.map(i => (<tr key={i.id}><td>{i.item_name}{i.description && <div className="ledger-muted" style={{ fontSize:'0.72rem' }}>{i.description}</div>}</td><td>{i.quantity}</td><td>{fmt(i.unit_price)}</td><td>{fmt(i.total)}</td></tr>))}</tbody>
            <tfoot><tr><td colSpan={3} style={{ fontWeight:700, textAlign:'right' }}>Grand Total</td><td style={{ fontWeight:700, color:'var(--color-primary)' }}>{fmt(inv.total_amount)}</td></tr></tfoot>
          </table>
        </div>
        {inv.notes && <div style={{ marginTop:'1rem', padding:'0.75rem', background:'var(--color-bg-light)', borderRadius:'10px', fontSize:'0.82rem' }}><strong>Notes:</strong> {inv.notes}</div>}
      </div>
      <div className="ledger-action-row">
        <button className="btn btn-outline" style={{ flex:1 }} onClick={() => openEdit(inv)}><Edit2 size={14}/> Edit</button>
        <button className="btn btn-outline" style={{ flex:1 }} onClick={() => printPurchaseInvoice(inv)}><Printer size={14}/> Print</button>
        <button className="btn btn-danger" style={{ flex:1 }} onClick={() => handleDelete(inv.id)}><Trash2 size={14}/> Delete</button>
      </div>
    </div>
  );

  // ── FORM (New / Edit) ───────────────────────────────────────
  return (
    <div>
      <button className="ledger-back-btn" onClick={() => setView('dashboard')}><ArrowLeft size={16}/> Cancel</button>
      <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:'0 0 1rem' }}>{view === 'edit' ? 'Edit Purchase' : 'New Purchase'}</h2>
      <form onSubmit={handleSave}>
        <div className="panel" style={{ padding:'1.25rem', marginBottom:'1rem' }}>
          <h3 className="ledger-section-title">Invoice Details</h3>
          <div className="ledger-form-grid">
            <div className="input-group"><label className="input-label">Invoice Number *</label><input className="input-field" value={form.invoice_number} onChange={e => setF('invoice_number', e.target.value)} placeholder="INV-001" required/></div>
            <div className="input-group"><label className="input-label">Purchase Date *</label><input type="date" className="input-field" value={form.purchase_date} onChange={e => setF('purchase_date', e.target.value)} required/></div>
            {/* Fix #6 & #7: Only Brand Name, with autocomplete */}
            <div className="input-group" style={{ gridColumn:'1/-1' }}>
              <label className="input-label">Brand Name *</label>
              <BrandAutocomplete value={form.brand_name} onChange={v => setF('brand_name', v)} brands={brands}/>
            </div>
          </div>
          {/* Fix #1: Only Cash and Cheque */}
          <div className="input-group" style={{ marginBottom:0 }}>
            <label className="input-label">Payment Method</label>
            <select className="input-field" value={form.payment_method} onChange={e => setF('payment_method', e.target.value)}>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          {form.payment_method === 'cheque' && (
            <div className="ledger-form-grid" style={{ marginTop:'0.75rem' }}>
              <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">Cheque Number</label><input className="input-field" value={form.cheque_number} onChange={e => setF('cheque_number', e.target.value)} placeholder="CQ-001"/></div>
              <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">Cheque Date</label><input type="date" className="input-field" value={form.cheque_date} onChange={e => setF('cheque_date', e.target.value)}/></div>
            </div>
          )}
        </div>

        <div className="panel" style={{ padding:'1.25rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <h3 className="ledger-section-title" style={{ margin:0 }}>Items</h3>
            <button type="button" className="btn btn-outline" style={{ padding:'0.3rem 0.7rem', fontSize:'0.75rem' }} onClick={() => setForm(f => ({ ...f, items:[...f.items, newRow()] }))}><Plus size={13}/> Add Row</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="ledger-table">
              <thead><tr><th>Item Name</th><th>Description</th><th>Qty</th><th>Unit Price (₹)</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {form.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td><input className="input-field" style={{ minWidth:'110px' }} value={item.item_name} onChange={e => updateItem(idx,'item_name',e.target.value)} placeholder="Item name" required/></td>
                    <td><input className="input-field" style={{ minWidth:'90px' }} value={item.description||''} onChange={e => updateItem(idx,'description',e.target.value)} placeholder="Optional"/></td>
                    {/* Fix #3: type="text" with inputMode="decimal" prevents browser rounding */}
                    <td><input type="text" inputMode="decimal" className="input-field" style={{ width:'65px' }} value={item.quantity} onChange={e => updateItem(idx,'quantity',e.target.value)}/></td>
                    <td><input type="text" inputMode="decimal" className="input-field" style={{ width:'100px' }} value={item.unit_price} onChange={e => updateItem(idx,'unit_price',e.target.value)}/></td>
                    <td style={{ fontWeight:600 }}>{fmt(r2(parseAmt(item.quantity)*parseAmt(item.unit_price)))}</td>
                    <td>{form.items.length > 1 && <button type="button" onClick={() => setForm(f => ({ ...f, items:f.items.filter((_,i) => i!==idx) }))} style={{ background:'none', border:'none', color:'var(--color-danger)', cursor:'pointer' }}><Trash2 size={14}/></button>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={4} style={{ fontWeight:700, textAlign:'right' }}>Grand Total</td><td style={{ fontWeight:700, color:'var(--color-primary)', fontSize:'1rem' }} colSpan={2}>{fmt(grandTotal)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        <div className="panel" style={{ padding:'1.25rem', marginBottom:'1.25rem' }}>
          <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">Notes (optional)</label><textarea className="input-field" rows={2} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Additional notes…" style={{ resize:'vertical' }}/></div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => setView('dashboard')}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>{saving ? 'Saving…' : view === 'edit' ? 'Update Purchase' : 'Save Purchase'}</button>
        </div>
        <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.85rem', background:'rgba(42,157,143,0.08)', borderRadius:'10px', fontSize:'0.78rem', color:'var(--color-accent)', display:'flex', gap:'0.4rem', alignItems:'center' }}>
          <AlertCircle size={14}/> Saving will update inventory stock automatically.
        </div>
      </form>
    </div>
  );
}
