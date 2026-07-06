import { useState, useEffect } from 'react';
import { Printer, Download, Eye, X } from 'lucide-react';
import { ledgerDb, r2, type PurchaseInvoice, type SalesInvoice } from '../../../lib/ledgerDb';
import { printPurchaseInvoice, printSaleInvoice, printReport } from '../../../lib/ledgerPrint';

const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
type ReportType = 'purchase' | 'sales' | 'outstanding';
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const getPeriodDates = (period: Period, cf: string, ct: string): [string, string] => {
  const now = new Date(); const p = (n: number) => String(n).padStart(2,'0');
  const ymd = (d: Date) => `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  if (period === 'custom') return [cf, ct];
  if (period === 'daily') { const t = ymd(now); return [t, t]; }
  if (period === 'weekly') { const from = new Date(now); from.setDate(now.getDate()-now.getDay()); const to = new Date(from); to.setDate(from.getDate()+6); return [ymd(from), ymd(to)]; }
  if (period === 'monthly') { const from = `${now.getFullYear()}-${p(now.getMonth()+1)}-01`; const last = new Date(now.getFullYear(),now.getMonth()+1,0).getDate(); return [from, `${now.getFullYear()}-${p(now.getMonth()+1)}-${last}`]; }
  return [`${now.getFullYear()}-01-01`, `${now.getFullYear()}-12-31`];
};

// Fix #5: Invoice detail modal
function InvoiceModal({ purchaseId, saleId, onClose, purchases, sales }: { purchaseId?: string; saleId?: string; onClose: () => void, purchases: PurchaseInvoice[], sales: SalesInvoice[] }) {
  const inv = purchaseId ? purchases.find(p => p.id === purchaseId) : saleId ? sales.find(s => s.id === saleId) : undefined;
  if (!inv) return null;
  const isPurchase = !!purchaseId;
  const p = inv as PurchaseInvoice; const s = inv as SalesInvoice;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'1.5rem', width:'100%', maxWidth:'520px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
          <div>
            <h3 style={{ margin:0, fontSize:'1.1rem' }}>{isPurchase ? 'Purchase' : 'Sales'} Invoice</h3>
            <p style={{ color:'var(--color-text-secondary)', margin:0, fontSize:'0.82rem' }}>#{isPurchase ? p.invoice_number : s.invoice_number}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-text-secondary)', padding:'0.25rem' }}><X size={20}/></button>
        </div>
        <div className="ledger-info-grid" style={{ marginBottom:'1rem' }}>
          {isPurchase ? <>
            <div><span className="ledger-info-label">Date</span><span className="ledger-info-val">{p.purchase_date}</span></div>
            <div><span className="ledger-info-label">Brand</span><span className="ledger-info-val">{p.brand_name}</span></div>
            <div><span className="ledger-info-label">Payment</span><span className="ledger-info-val">{p.payment_method.toUpperCase()}</span></div>
            {p.cheque_number && <div><span className="ledger-info-label">Cheque No.</span><span className="ledger-info-val">{p.cheque_number}</span></div>}
          </> : <>
            <div><span className="ledger-info-label">Date</span><span className="ledger-info-val">{s.sale_date}</span></div>
            <div><span className="ledger-info-label">Customer</span><span className="ledger-info-val">{s.customer_name}</span></div>
            <div><span className="ledger-info-label">Phone</span><span className="ledger-info-val">{s.customer_phone||'—'}</span></div>
            <div><span className="ledger-info-label">Payment</span><span className="ledger-info-val">{s.payment_method.toUpperCase()}</span></div>
          </>}
        </div>
        {!isPurchase && s.previous_balance > 0 && (
          <div style={{ padding:'0.65rem', background:'#FEF3C7', borderRadius:'8px', fontSize:'0.82rem', fontWeight:600, color:'#92400E', marginBottom:'0.75rem' }}>
            ⚠️ Previous Outstanding: {fmt(s.previous_balance)}
          </div>
        )}
        <div className="ledger-table-container">
          <table className="ledger-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>
              {(isPurchase ? p.items : s.items).map(i => (
                <tr key={i.id}><td>{i.item_name}</td><td>{i.quantity}</td><td>{fmt(i.unit_price)}</td><td>{fmt(i.total)}</td></tr>
              ))}
            </tbody>
            <tfoot>
              {isPurchase ? (
                <tr><td colSpan={3} style={{ textAlign:'right', fontWeight:700 }}>Grand Total</td><td style={{ fontWeight:700, color:'var(--color-primary)' }}>{fmt(p.total_amount)}</td></tr>
              ) : (<>
                <tr><td colSpan={3} style={{ textAlign:'right', fontWeight:700 }}>Items Total</td><td>{fmt(s.total_amount)}</td></tr>
                <tr><td colSpan={3} style={{ textAlign:'right' }}>Paid</td><td style={{ color:'var(--color-accent)' }}>- {fmt(s.amount_paid)}</td></tr>
                <tr><td colSpan={3} style={{ textAlign:'right', fontWeight:700 }}>Balance Due</td><td style={{ fontWeight:700, color: s.balance_due>0?'#D97706':'var(--color-accent)' }}>{fmt(s.balance_due)}</td></tr>
              </>)}
            </tfoot>
          </table>
        </div>
        {(isPurchase ? p.notes : s.notes) && (
          <div style={{ marginTop:'0.75rem', padding:'0.65rem', background:'var(--color-bg-light)', borderRadius:'8px', fontSize:'0.82rem' }}>
            <strong>Notes:</strong> {isPurchase ? p.notes : s.notes}
          </div>
        )}
        <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
          <button className="btn btn-outline" style={{ flex:1, fontSize:'0.8rem' }} onClick={() => isPurchase ? printPurchaseInvoice(p) : printSaleInvoice(s)}>
            <Printer size={13}/> Print Invoice
          </button>
          <button className="btn btn-outline" style={{ flex:1, fontSize:'0.8rem' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [type, setType] = useState<ReportType>('sales');
  const [period, setPeriod] = useState<Period>('monthly');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [modalPurchaseId, setModalPurchaseId] = useState<string|undefined>();
  const [modalSaleId, setModalSaleId] = useState<string|undefined>();

  const [purchaseData, setPurchaseData] = useState<PurchaseInvoice[]>([]);
  const [salesData, setSalesData] = useState<SalesInvoice[]>([]);
  const [customers, setCustomers] = useState<import('../../../lib/ledgerDb').Customer[]>([]);

  const [from, to] = getPeriodDates(period, customFrom, customTo);

  useEffect(() => {
    const load = async () => {
      if (type === 'purchase') {
        let data = from && to ? await ledgerDb.getFilteredPurchases(from, to) : await ledgerDb.getPurchases();
        if (brandFilter) data = data.filter(p => p.brand_name.toLowerCase().includes(brandFilter.toLowerCase()));
        setPurchaseData(data);
      } else if (type === 'sales') {
        let data = from && to ? await ledgerDb.getFilteredSales(from, to) : await ledgerDb.getSales();
        if (customerFilter) data = data.filter(s => s.customer_name.toLowerCase().includes(customerFilter.toLowerCase()));
        setSalesData(data);
      } else if (type === 'outstanding') {
        const all = await ledgerDb.getCustomers();
        setCustomers(all.filter(c => c.outstanding_balance > 0));
      }
    };
    load();
  }, [type, from, to, brandFilter, customerFilter]);

  const purchaseTotal = r2(purchaseData.reduce((s,p) => s+p.total_amount, 0));
  const salesTotal = r2(salesData.reduce((s,i) => s+i.total_amount, 0));
  const collectedTotal = r2(salesData.reduce((s,i) => s+i.amount_paid, 0));
  const outstandingTotal = r2(salesData.reduce((s,i) => s+i.balance_due, 0));

  // Fix #4: Proper report print using new window
  const handlePrint = () => {
    let bodyHtml: string;
    const periodStr = `${from} → ${to}`;
    if (type === 'purchase') {
      const rows = purchaseData.map((p,i) => `<tr><td>${i+1}</td><td><strong>${p.invoice_number}</strong></td><td>${p.purchase_date}</td><td>${p.brand_name}</td><td>${p.payment_method.toUpperCase()}</td><td><strong>${fmt(p.total_amount)}</strong></td></tr>`).join('');
      bodyHtml = `
        <div class="summary-grid">
          <div class="summary-card"><div class="summary-lbl">Total Purchases</div><div class="summary-val" style="color:#E63946">${fmt(purchaseTotal)}</div></div>
          <div class="summary-card"><div class="summary-lbl">Invoices</div><div class="summary-val">${purchaseData.length}</div></div>
          <div class="summary-card amber"><div class="summary-lbl">Cheques</div><div class="summary-val">${purchaseData.filter(p=>p.payment_method==='cheque').length}</div></div>
        </div>
        <table><thead><tr><th>#</th><th>Invoice</th><th>Date</th><th>Brand</th><th>Payment</th><th>Total</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999">No data</td></tr>'}</tbody>
        ${purchaseData.length>0?`<tfoot><tr><td colspan="5" style="text-align:right">Grand Total</td><td style="color:#E63946">${fmt(purchaseTotal)}</td></tr></tfoot>`:''}</table>`;
    } else if (type === 'sales') {
      const rows = salesData.map((s,i) => `<tr><td>${i+1}</td><td><strong>${s.invoice_number}</strong></td><td>${s.sale_date}</td><td>${s.customer_name}</td><td>${fmt(s.total_amount)}</td><td style="color:#2A9D8F">${fmt(s.amount_paid)}</td><td style="color:${s.balance_due>0?'#D97706':'#2A9D8F'}">${fmt(s.balance_due)}</td><td>${s.balance_due>0?'PARTIAL':'PAID'}</td></tr>`).join('');
      bodyHtml = `
        <div class="summary-grid">
          <div class="summary-card"><div class="summary-lbl">Total Sales</div><div class="summary-val" style="color:#E63946">${fmt(salesTotal)}</div></div>
          <div class="summary-card green"><div class="summary-lbl">Collected</div><div class="summary-val" style="color:#2A9D8F">${fmt(collectedTotal)}</div></div>
          <div class="summary-card amber"><div class="summary-lbl">Outstanding</div><div class="summary-val" style="color:#D97706">${fmt(outstandingTotal)}</div></div>
        </div>
        <table><thead><tr><th>#</th><th>Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#999">No data</td></tr>'}</tbody>
        ${salesData.length>0?`<tfoot><tr><td colspan="4" style="text-align:right">Totals</td><td>${fmt(salesTotal)}</td><td style="color:#2A9D8F">${fmt(collectedTotal)}</td><td style="color:#D97706">${fmt(outstandingTotal)}</td><td></td></tr></tfoot>`:''}</table>`;
    } else {
      const rows = customers.map((c,i) => `<tr><td>${i+1}</td><td><strong>${c.name}</strong></td><td>${c.phone||'—'}</td><td style="color:#D97706;font-weight:700">${fmt(c.outstanding_balance)}</td><td>${c.last_purchase_date||'—'}</td></tr>`).join('');
      bodyHtml = `
        <div class="summary-grid">
          <div class="summary-card amber"><div class="summary-lbl">Total Outstanding</div><div class="summary-val" style="color:#D97706">${fmt(customers.reduce((s,c)=>s+c.outstanding_balance,0))}</div></div>
          <div class="summary-card"><div class="summary-lbl">Customers</div><div class="summary-val">${customers.length}</div></div>
        </div>
        <table><thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Outstanding</th><th>Last Purchase</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#999">No outstanding balances</td></tr>'}</tbody>
        ${customers.length>0?`<tfoot><tr><td colspan="3" style="text-align:right">Total Due</td><td style="color:#D97706">${fmt(customers.reduce((s,c)=>s+c.outstanding_balance,0))}</td><td></td></tr></tfoot>`:''}</table>`;
    }
    const titleMap = { purchase: 'Purchase Report', sales: 'Sales Report', outstanding: 'Outstanding Report' };
    printReport(titleMap[type], periodStr, bodyHtml);
  };

  const handleExportCSV = () => {
    let csv: string;
    if (type === 'purchase') {
      csv = 'Invoice,Date,Brand,Payment,Total\n' + purchaseData.map(p => `${p.invoice_number},${p.purchase_date},${p.brand_name},${p.payment_method},${p.total_amount}`).join('\n');
    } else if (type === 'sales') {
      csv = 'Invoice,Date,Customer,Phone,Total,Paid,Balance,Payment\n' + salesData.map(s => `${s.invoice_number},${s.sale_date},${s.customer_name},${s.customer_phone},${s.total_amount},${s.amount_paid},${s.balance_due},${s.payment_method}`).join('\n');
    } else {
      csv = 'Customer,Phone,Outstanding Balance,Last Purchase\n' + customers.map(c => `${c.name},${c.phone},${c.outstanding_balance},${c.last_purchase_date||''}`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ledger-${type}-${from}-${to}.csv`; a.click();
  };

  return (
    <div>
      {(modalPurchaseId || modalSaleId) && (
        <InvoiceModal purchaseId={modalPurchaseId} saleId={modalSaleId} onClose={() => { setModalPurchaseId(undefined); setModalSaleId(undefined); }} purchases={purchaseData} sales={salesData} />
      )}

      <div style={{ marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:'0 0 0.25rem' }}>Reports</h2>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'0.82rem', margin:0 }}>Generate, view, and export ledger reports</p>
      </div>

      <div className="panel" style={{ padding:'1.25rem', marginBottom:'1rem' }}>
        <div className="ledger-form-grid">
          <div className="input-group" style={{ marginBottom:0 }}>
            <label className="input-label">Report Type</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value as ReportType)}>
              <option value="purchase">Purchase Report</option>
              <option value="sales">Sales Report</option>
              <option value="outstanding">Outstanding Report</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom:0 }}>
            <label className="input-label">Period</label>
            <select className="input-field" value={period} onChange={e => setPeriod(e.target.value as Period)}>
              <option value="daily">Daily (Today)</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {period === 'custom' && <>
            <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">From</label><input type="date" className="input-field" value={customFrom} onChange={e => setCustomFrom(e.target.value)}/></div>
            <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">To</label><input type="date" className="input-field" value={customTo} onChange={e => setCustomTo(e.target.value)}/></div>
          </>}
          {type === 'purchase' && <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">Filter by Brand</label><input className="input-field" value={brandFilter} onChange={e => setBrandFilter(e.target.value)} placeholder="All brands"/></div>}
          {type === 'sales' && <div className="input-group" style={{ marginBottom:0 }}><label className="input-label">Filter by Customer</label><input className="input-field" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} placeholder="All customers"/></div>}
        </div>
        <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem', flexWrap:'wrap' }}>
          <button className="btn btn-outline" style={{ flex:1, fontSize:'0.8rem', padding:'0.5rem' }} onClick={handlePrint}><Printer size={14}/> Print Report</button>
          <button className="btn btn-outline" style={{ flex:1, fontSize:'0.8rem', padding:'0.5rem' }} onClick={handleExportCSV}><Download size={14}/> Export CSV</button>
        </div>
      </div>

      <div style={{ padding:'0.5rem 0', marginBottom:'0.75rem', borderBottom:'2px solid rgba(230,57,70,0.1)' }}>
        <p style={{ fontWeight:700, fontSize:'0.9rem', margin:0 }}>Period: {from} → {to}</p>
      </div>

      {type === 'purchase' && (<>
        <div className="ledger-stats-grid" style={{ marginBottom:'1rem' }}>
          <div className="ledger-stat-card" style={{ borderTop:'3px solid var(--color-primary)' }}><p className="ledger-stat-label">Total Purchases</p><p className="ledger-stat-value" style={{ color:'var(--color-primary)' }}>{fmt(purchaseTotal)}</p><p className="ledger-stat-sub">{purchaseData.length} invoices</p></div>
          <div className="ledger-stat-card" style={{ borderTop:'3px solid var(--color-warning)' }}><p className="ledger-stat-label">Cheques</p><p className="ledger-stat-value" style={{ color:'var(--color-warning)' }}>{purchaseData.filter(p=>p.payment_method==='cheque').length}</p><p className="ledger-stat-sub">pending</p></div>
        </div>
        <div className="panel" style={{ padding:'0.5rem' }}>
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead><tr><th>#</th><th>Invoice</th><th>Date</th><th>Brand</th><th>Payment</th><th>Total</th><th>View</th></tr></thead>
              <tbody>
                {purchaseData.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:'1.5rem' }}>No data for selected period.</td></tr>
                  : purchaseData.map((p,i) => (
                    <tr key={p.id}>
                      <td style={{ color:'var(--color-text-secondary)' }}>{i+1}</td>
                      <td style={{ fontWeight:600 }}>{p.invoice_number}</td>
                      <td>{p.purchase_date}</td>
                      <td>{p.brand_name}</td>
                      <td><span className={`badge ${p.payment_method==='cheque'?'badge-warning':'badge-success'}`} style={{ fontSize:'0.65rem' }}>{p.payment_method}</span></td>
                      <td style={{ fontWeight:700 }}>{fmt(p.total_amount)}</td>
                      {/* Fix #5: View invoice button */}
                      <td><button onClick={() => setModalPurchaseId(p.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-accent)', padding:'0.2rem' }}><Eye size={15}/></button></td>
                    </tr>
                  ))}
              </tbody>
              {purchaseData.length > 0 && <tfoot><tr><td colSpan={5} style={{ fontWeight:700, textAlign:'right' }}>Grand Total</td><td style={{ fontWeight:700, color:'var(--color-primary)' }}>{fmt(purchaseTotal)}</td><td></td></tr></tfoot>}
            </table>
          </div>
        </div>
      </>)}

      {type === 'sales' && (<>
        <div className="ledger-stats-grid" style={{ marginBottom:'1rem' }}>
          {[{ l:'Total Sales', v:fmt(salesTotal), c:'var(--color-primary)' }, { l:'Collected', v:fmt(collectedTotal), c:'var(--color-accent)' }, { l:'Outstanding', v:fmt(outstandingTotal), c:'var(--color-warning)' }].map(s => (
            <div key={s.l} className="ledger-stat-card" style={{ borderTop:`3px solid ${s.c}` }}><p className="ledger-stat-label">{s.l}</p><p className="ledger-stat-value" style={{ color:s.c }}>{s.v}</p></div>
          ))}
        </div>
        <div className="panel" style={{ padding:'0.5rem' }}>
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead><tr><th>#</th><th>Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>View</th></tr></thead>
              <tbody>
                {salesData.length === 0 ? <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:'1.5rem' }}>No data for selected period.</td></tr>
                  : salesData.map((s,i) => (
                    <tr key={s.id}>
                      <td style={{ color:'var(--color-text-secondary)' }}>{i+1}</td>
                      <td style={{ fontWeight:600 }}>{s.invoice_number}</td>
                      <td>{s.sale_date}</td>
                      <td>{s.customer_name}</td>
                      <td style={{ fontWeight:700 }}>{fmt(s.total_amount)}</td>
                      <td style={{ color:'var(--color-accent)' }}>{fmt(s.amount_paid)}</td>
                      <td style={{ color:s.balance_due>0?'#D97706':'var(--color-accent)', fontWeight:600 }}>{fmt(s.balance_due)}</td>
                      <td><span className={`badge ${s.balance_due>0?'badge-warning':'badge-success'}`} style={{ fontSize:'0.65rem' }}>{s.balance_due>0?'PARTIAL':'PAID'}</span></td>
                      {/* Fix #5: View invoice button */}
                      <td><button onClick={() => setModalSaleId(s.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-accent)', padding:'0.2rem' }}><Eye size={15}/></button></td>
                    </tr>
                  ))}
              </tbody>
              {salesData.length > 0 && <tfoot><tr><td colSpan={4} style={{ fontWeight:700, textAlign:'right' }}>Totals</td><td style={{ fontWeight:700, color:'var(--color-primary)' }}>{fmt(salesTotal)}</td><td style={{ fontWeight:700, color:'var(--color-accent)' }}>{fmt(collectedTotal)}</td><td style={{ fontWeight:700, color:'#D97706' }}>{fmt(outstandingTotal)}</td><td colSpan={2}></td></tr></tfoot>}
            </table>
          </div>
        </div>
      </>)}

      {type === 'outstanding' && (<>
        <div className="ledger-stats-grid" style={{ marginBottom:'1rem' }}>
          <div className="ledger-stat-card" style={{ borderTop:'3px solid var(--color-warning)' }}>
            <p className="ledger-stat-label">Total Outstanding</p>
            <p className="ledger-stat-value" style={{ color:'var(--color-warning)' }}>{fmt(r2(customers.reduce((s,c)=>s+c.outstanding_balance,0)))}</p>
            <p className="ledger-stat-sub">{customers.length} customers</p>
          </div>
        </div>
        <div className="panel" style={{ padding:'0.5rem' }}>
          <div className="ledger-table-container">
            <table className="ledger-table">
              <thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Outstanding</th><th>Last Purchase</th></tr></thead>
              <tbody>
                {customers.length === 0 ? <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--color-text-secondary)', padding:'1.5rem' }}>No outstanding balances.</td></tr>
                  : customers.map((c,i) => (
                    <tr key={c.id}>
                      <td style={{ color:'var(--color-text-secondary)' }}>{i+1}</td>
                      <td style={{ fontWeight:600 }}>{c.name}</td>
                      <td>{c.phone||'—'}</td>
                      <td style={{ fontWeight:700, color:'#D97706' }}>{fmt(c.outstanding_balance)}</td>
                      <td>{c.last_purchase_date||'—'}</td>
                    </tr>
                  ))}
              </tbody>
              {customers.length>0 && <tfoot><tr><td colSpan={3} style={{ fontWeight:700, textAlign:'right' }}>Total Due</td><td style={{ fontWeight:700, color:'#D97706' }}>{fmt(r2(customers.reduce((s,c)=>s+c.outstanding_balance,0)))}</td><td></td></tr></tfoot>}
            </table>
          </div>
        </div>
      </>)}
    </div>
  );
}
