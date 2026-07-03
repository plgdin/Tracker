import { useState, useEffect } from 'react';
import { Printer, CreditCard } from 'lucide-react';
import { ledgerDb, type Customer, type SalePaymentMethod } from '../../lib/ledgerDb';
import { useToastStore } from '../../store/toastStore';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OutstandingPage() {
  const showToast = useToastStore(s => s.showToast);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [collecting, setCollecting] = useState<Customer | null>(null);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState<SalePaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const data = await ledgerDb.getCustomers();
    setCustomers(data.filter(c => c.outstanding_balance > 0));
  };
  useEffect(() => {
    let active = true;
    (async () => {
      const data = await ledgerDb.getCustomers();
      if (active) {
        setCustomers(data.filter(c => c.outstanding_balance > 0));
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = search ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) : customers;
  const totalDue = customers.reduce((s, c) => s + c.outstanding_balance, 0);

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collecting) return;
    const amount = Number(payAmt);
    if (!amount || amount <= 0) { showToast('Enter a valid amount'); return; }
    if (amount > collecting.outstanding_balance) { showToast(`Amount exceeds outstanding balance of ${fmt(collecting.outstanding_balance)}`); return; }
    setSaving(true);
    try {
      await ledgerDb.addPayment({ customer_name: collecting.name, customer_phone: collecting.phone, amount, payment_method: payMethod, notes: payNotes || undefined });
      showToast(`Payment of ${fmt(amount)} collected ✅`);
      setCollecting(null); setPayAmt(''); setPayNotes(''); refresh();
    } finally { setSaving(false); }
  };

  const handlePrintStatement = async (c: Customer) => {
    const allSales = await ledgerDb.getSales();
    const sales = allSales.filter(s => s.customer_name.toLowerCase() === c.name.toLowerCase());
    const allPayments = await ledgerDb.getPayments();
    const payments = allPayments.filter(p => p.customer_name.toLowerCase() === c.name.toLowerCase());
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Statement - ${c.name}</title>
      <style>body{font-family:sans-serif;padding:2rem;color:#2E1E1E}h1{color:#E63946}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:0.5rem;text-align:left}th{background:#f8f8f8}.total{font-weight:bold;font-size:1.1rem;margin-top:1rem}</style>
      </head><body>
      <h1>Customer Statement</h1>
      <p><strong>Customer:</strong> ${c.name} &nbsp; <strong>Phone:</strong> ${c.phone}</p>
      <p><strong>Outstanding Balance:</strong> ${fmt(c.outstanding_balance)}</p>
      <h3>Sales History</h3>
      <table><thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
      <tbody>${sales.map(s => `<tr><td>${s.invoice_number}</td><td>${s.sale_date}</td><td>${fmt(s.total_amount)}</td><td>${fmt(s.amount_paid)}</td><td>${fmt(s.balance_due)}</td></tr>`).join('')}</tbody></table>
      <h3>Payments Received</h3>
      <table><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th></tr></thead>
      <tbody>${payments.map(p => `<tr><td>${new Date(p.created_at).toLocaleDateString('en-IN')}</td><td>${fmt(p.amount)}</td><td>${p.payment_method}</td><td>${p.notes||'-'}</td></tr>`).join('')}</tbody></table>
      <p class="total">Current Outstanding: ${fmt(c.outstanding_balance)}</p>
      </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div>
      <div style={{ marginBottom:'1rem' }}>
        <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:'0 0 0.25rem' }}>Outstanding Customers</h2>
        <p style={{ color:'var(--color-text-secondary)', fontSize:'0.82rem', margin:0 }}>
          {customers.length} customers · Total Due: <strong style={{ color:'var(--color-warning)' }}>{fmt(totalDue)}</strong>
        </p>
      </div>

      <input className="input-field" placeholder="🔍 Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:'1rem' }}/>

      {filtered.length === 0 ? (
        <div className="panel" style={{ textAlign:'center', padding:'3rem 1rem' }}>
          <p style={{ fontSize:'2rem', margin:'0 0 0.5rem' }}>🎉</p>
          <p style={{ color:'var(--color-text-secondary)', fontSize:'0.9rem' }}>{search ? 'No matching customers.' : 'No outstanding balances! All customers are settled.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map(c => (
            <div key={c.id} className="panel" style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.95rem', margin:'0 0 0.15rem' }}>👤 {c.name}</p>
                  <p style={{ color:'var(--color-text-secondary)', fontSize:'0.78rem', margin:0 }}>📞 {c.phone || '—'}{c.last_purchase_date ? ` · Last: ${c.last_purchase_date}` : ''}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'1.05rem', fontWeight:700, color:'#D97706', margin:'0 0 0.15rem' }}>{fmt(c.outstanding_balance)}</p>
                  <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'0.68rem', fontWeight:700, padding:'0.15rem 0.4rem', borderRadius:'99px' }}>OUTSTANDING</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                <button className="btn btn-primary" style={{ flex:1, fontSize:'0.78rem', padding:'0.45rem 0.75rem' }} onClick={() => { setCollecting(c); setPayAmt(''); setPayNotes(''); setPayMethod('cash'); }}>
                  <CreditCard size={13}/> Collect Payment
                </button>
                <button className="btn btn-outline" style={{ flex:1, fontSize:'0.78rem', padding:'0.45rem 0.75rem' }} onClick={() => handlePrintStatement(c)}>
                  <Printer size={13}/> Print Statement
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collect Payment Modal */}
      {collecting && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={e => { if (e.target === e.currentTarget) setCollecting(null); }}>
          <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:'1.75rem', width:'100%', maxWidth:'500px', animation:'slideUp 0.3s ease' }}>
            <h3 style={{ margin:'0 0 0.25rem', fontSize:'1.05rem' }}>Collect Payment</h3>
            <p style={{ color:'var(--color-text-secondary)', fontSize:'0.82rem', margin:'0 0 1.25rem' }}>
              Customer: <strong>{collecting.name}</strong> · Outstanding: <strong style={{ color:'#D97706' }}>{fmt(collecting.outstanding_balance)}</strong>
            </p>
            <form onSubmit={handleCollect} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div className="input-group" style={{ marginBottom:0 }}>
                <label className="input-label">Amount Received (₹)</label>
                <input type="number" className="input-field" value={payAmt} min={0.01} max={collecting.outstanding_balance} step="0.01" onChange={e => setPayAmt(e.target.value)} placeholder="Enter amount" required autoFocus/>
              </div>
              <div className="input-group" style={{ marginBottom:0 }}>
                <label className="input-label">Payment Method</label>
                <select className="input-field" value={payMethod} onChange={e => setPayMethod(e.target.value as SalePaymentMethod)}>
                  <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom:0 }}>
                <label className="input-label">Notes (optional)</label>
                <input className="input-field" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="e.g. Paid via GPay"/>
              </div>
              {payAmt && Number(payAmt) > 0 && (
                <div style={{ padding:'0.6rem 0.85rem', background:'rgba(42,157,143,0.08)', borderRadius:'10px', fontSize:'0.8rem', color:'var(--color-accent)', fontWeight:600 }}>
                  Remaining after payment: {fmt(Math.max(0, collecting.outstanding_balance - Number(payAmt)))}
                </div>
              )}
              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => setCollecting(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>{saving ? 'Saving…' : 'Confirm Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
