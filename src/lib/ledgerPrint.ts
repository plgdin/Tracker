// ============================================================
// Ledger Print Utilities — Fix #4: Proper print via new window
// All print functions open a full HTML document in a new tab
// ============================================================

const STORE = 'Chef & Joy';

const openPrint = (body: string, title: string) => {
  const w = window.open('', '_blank', 'width=820,height=680');
  if (!w) { alert('Please allow popups to enable printing.'); return; }
  w.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:2rem;font-size:14px;background:#fff}
  .store-header{text-align:center;border-bottom:3px solid #E63946;padding-bottom:1rem;margin-bottom:1.5rem}
  .store-name{font-size:1.6rem;font-weight:800;color:#E63946;letter-spacing:-0.5px}
  .inv-title{font-size:1rem;color:#666;margin-top:0.25rem}
  .inv-badge{display:inline-block;padding:.15rem .5rem;border-radius:4px;font-size:.75rem;font-weight:700;background:#D1FAE5;color:#065F46}
  .inv-badge.warn{background:#FEF3C7;color:#92400E}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:.5rem 1.5rem;margin-bottom:1.25rem}
  .info-label{font-size:.68rem;text-transform:uppercase;color:#888;font-weight:700;display:block;margin-bottom:.1rem}
  .info-val{font-size:.9rem;font-weight:600}
  table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.85rem}
  thead th{background:#f5f5f5;padding:.5rem .75rem;text-align:left;font-size:.72rem;text-transform:uppercase;color:#666;font-weight:700;border-bottom:2px solid #E63946}
  tbody td{padding:.5rem .75rem;border-bottom:1px solid #eee}
  tbody tr:last-child td{border-bottom:none}
  tfoot td{padding:.5rem .75rem;border-top:2px solid #E63946;font-weight:700;background:#fafafa}
  .total-final{font-size:1rem;color:#E63946}
  .section{margin:1rem 0;padding:.75rem;background:#f9f9f9;border-radius:6px;font-size:.88rem}
  .section-label{font-size:.7rem;text-transform:uppercase;color:#888;font-weight:700;margin-bottom:.25rem}
  .outstanding-box{background:#FEF3C7;padding:.75rem;border-radius:6px;border-left:3px solid #D97706;margin:.75rem 0;font-weight:600;color:#92400E}
  .footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee;font-size:.75rem;color:#999;text-align:center}
  .sep{border:none;border-top:1px dashed #ddd;margin:1rem 0}
  .report-header{margin-bottom:1.25rem;padding-bottom:.75rem;border-bottom:2px solid #E63946}
  .report-title{font-size:1.3rem;font-weight:800;color:#E63946}
  .report-period{font-size:.85rem;color:#666;margin-top:.2rem}
  .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-bottom:1.25rem}
  .summary-card{padding:.85rem;background:#f9f9f9;border-radius:8px;border-top:3px solid #E63946}
  .summary-card.green{border-top-color:#2A9D8F}
  .summary-card.amber{border-top-color:#F59E0B}
  .summary-val{font-size:1.1rem;font-weight:800;margin:.25rem 0}
  .summary-lbl{font-size:.68rem;text-transform:uppercase;color:#888}
  @page{margin:1.5cm}
  @media print{body{padding:.5rem}button{display:none}}
</style>
</head><body>${body}
<div class="footer">Printed from Chef & Joy Ledger · ${new Date().toLocaleString('en-IN')}</div>
<script>window.onload=()=>{setTimeout(()=>{window.print()},350)}</script>
</body></html>`);
  w.document.close();
};

const fmtMoney = (n: number) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Purchase Invoice Print ────────────────────────────────────
import type { PurchaseInvoice } from './ledgerDb';
export const printPurchaseInvoice = (inv: PurchaseInvoice) => {
  const rows = inv.items.map(i =>
    `<tr><td>${i.item_name}${i.description ? `<br/><small style="color:#888">${i.description}</small>` : ''}</td><td>${i.quantity}</td><td>${fmtMoney(i.unit_price)}</td><td>${fmtMoney(i.total)}</td></tr>`
  ).join('');

  const body = `
<div class="store-header">
  <div class="store-name">${STORE}</div>
  <div class="inv-title">Purchase Invoice</div>
</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
  <div>
    <div style="font-size:1.1rem;font-weight:700">#${inv.invoice_number}</div>
  </div>
  <span class="inv-badge${inv.payment_method === 'cheque' ? ' warn' : ''}">${inv.payment_method.toUpperCase()}</span>
</div>
<div class="info-grid">
  <div><span class="info-label">Purchase Date</span><span class="info-val">${inv.purchase_date}</span></div>
  <div><span class="info-label">Brand</span><span class="info-val">${inv.brand_name}</span></div>
  ${inv.cheque_number ? `<div><span class="info-label">Cheque No.</span><span class="info-val">${inv.cheque_number}</span></div>` : ''}
  ${inv.cheque_date ? `<div><span class="info-label">Cheque Date</span><span class="info-val">${inv.cheque_date}</span></div>` : ''}
</div>
<table>
  <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td colspan="3" style="text-align:right">Grand Total</td><td class="total-final">${fmtMoney(inv.total_amount)}</td></tr></tfoot>
</table>
${inv.notes ? `<div class="section"><div class="section-label">Notes</div>${inv.notes}</div>` : ''}`;

  openPrint(body, `Purchase Invoice ${inv.invoice_number}`);
};

// ── Sales Invoice Print ───────────────────────────────────────
import type { SalesInvoice } from './ledgerDb';
export const printSaleInvoice = (inv: SalesInvoice) => {
  const rows = inv.items.map(i =>
    `<tr><td>${i.item_name}${i.description ? `<br/><small style="color:#888">${i.description}</small>` : ''}</td><td>${i.quantity}</td><td>${fmtMoney(i.unit_price)}</td><td>${fmtMoney(i.total)}</td></tr>`
  ).join('');

  const body = `
<div class="store-header">
  <div class="store-name">${STORE}</div>
  <div class="inv-title">Sales Invoice</div>
</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
  <div><div style="font-size:1.1rem;font-weight:700">#${inv.invoice_number}</div></div>
  <div style="display:flex;gap:.4rem;flex-wrap:wrap">
    <span class="inv-badge${inv.balance_due > 0 ? ' warn' : ''}">${inv.balance_due > 0 ? 'PARTIAL' : 'PAID'}</span>
    <span class="inv-badge">${inv.payment_method.toUpperCase()}</span>
  </div>
</div>
<div class="info-grid">
  <div><span class="info-label">Sale Date</span><span class="info-val">${inv.sale_date}</span></div>
  <div><span class="info-label">Customer</span><span class="info-val">${inv.customer_name}</span></div>
  <div><span class="info-label">Phone</span><span class="info-val">${inv.customer_phone || '—'}</span></div>
</div>
${inv.previous_balance > 0 ? `<div class="outstanding-box">⚠ Previous Outstanding Balance: ${fmtMoney(inv.previous_balance)}</div>` : ''}
<table>
  <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr><td colspan="3" style="text-align:right">Items Total</td><td>${fmtMoney(inv.total_amount)}</td></tr>
    <tr><td colspan="3" style="text-align:right">Amount Paid</td><td style="color:#2A9D8F">- ${fmtMoney(inv.amount_paid)}</td></tr>
    <tr><td colspan="3" style="text-align:right">Balance Due</td><td class="total-final" style="color:${inv.balance_due > 0 ? '#D97706' : '#2A9D8F'}">${fmtMoney(inv.balance_due)}</td></tr>
  </tfoot>
</table>
${inv.notes ? `<div class="section"><div class="section-label">Notes</div>${inv.notes}</div>` : ''}`;

  openPrint(body, `Sales Invoice ${inv.invoice_number}`);
};

// ── Report Print ─────────────────────────────────────────────
export const printReport = (title: string, period: string, bodyHtml: string) => {
  const body = `
<div class="store-header">
  <div class="store-name">${STORE}</div>
  <div class="inv-title">${title}</div>
</div>
<div class="report-header">
  <div class="report-period">Period: ${period}</div>
</div>
${bodyHtml}`;

  openPrint(body, `${STORE} — ${title}`);
};
