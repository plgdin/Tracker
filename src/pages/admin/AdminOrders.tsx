import { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  Eye, 
  X
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus, PaymentStatus } from '../../types/ecommerce';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    const list = await orderService.getAll();
    setOrders(list);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await orderService.updateStatus(orderId, status);
    if (inspectingOrder?.id === orderId) {
      setInspectingOrder(updated);
    }
    loadOrders();
  };

  const handleUpdatePaymentStatus = async (orderId: string, pStatus: PaymentStatus) => {
    const updated = await orderService.updatePaymentStatus(orderId, pStatus);
    if (inspectingOrder?.id === orderId) {
      setInspectingOrder(updated);
    }
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-[#351E28]">
          Customer Orders & In-Store Pickups
        </h1>
        <p className="text-xs sm:text-sm text-[#351E28]/70 mt-0.5">
          Process online submissions, coordinate customer WhatsApp inquiries, and manage counter status
        </p>
      </div>

      {/* Toolbar: Search and Status Tabs */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (BNJ-...), name or phone..."
              className="w-full bg-[#F8F7F0] border border-[#351E28]/15 rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold text-[#351E28] outline-none focus:border-[#FF5C34]"
            />
            <Search className="w-4 h-4 text-[#351E28]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-xs font-bold text-[#AEBBA0] self-end sm:self-auto">
            Total Orders: {orders.length}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'new', label: 'New' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'ready_for_pickup', label: 'Ready for Pickup' },
            { id: 'completed', label: 'Collected / Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => {
            const count = tab.id === 'all' 
              ? orders.length 
              : orders.filter((o) => o.orderStatus === tab.id).length;
            const isSelected = selectedStatus === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#351E28] text-[#EAF05C] border-[#351E28] shadow-sm'
                    : 'bg-[#F8F7F0] text-[#351E28]/70 border-transparent hover:bg-[#D7EFFF]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border-2 border-[#351E28]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F0] border-b border-[#351E28]/10 text-[#351E28]/70 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Pickup Preference</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#351E28]/5 text-[#351E28]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#351E28]/50 font-bold">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F8F7F0]/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-black text-[#FF5C34]">
                      {o.orderNumber}
                    </td>
                    <td className="py-4 px-4 text-[#351E28]/60 font-semibold whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold">{o.customerName}</div>
                      <div className="text-[11px] text-[#351E28]/60">{o.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#351E28]/80 max-w-[140px] truncate">
                      {o.pickupPreference}
                    </td>
                    <td className="py-4 px-4 font-heading font-black text-sm">
                      ₹{o.total}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.paymentStatus === 'refunded'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${
                          o.orderStatus === 'ready_for_pickup'
                            ? 'bg-[#EAF05C] text-[#351E28] border-[#351E28]'
                            : o.orderStatus === 'confirmed'
                            ? 'bg-[#D7EFFF] text-[#351E28] border-blue-300'
                            : o.orderStatus === 'completed'
                            ? 'bg-[#AEBBA0]/30 text-[#351E28] border-[#AEBBA0]'
                            : 'bg-[#F8F7F0] text-[#351E28] border-[#351E28]/20'
                        }`}
                      >
                        <option value="new">New Order</option>
                        <option value="pending">Pending Confirmation</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="completed">Collected / Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingOrder(o)}
                          className="p-1.5 rounded-xl bg-[#F8F7F0] hover:bg-[#D7EFFF] text-[#351E28] transition-colors"
                          title="Inspect Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${(o.customerWhatsapp || o.customerPhone).replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(o.customerName)}%2C%20regarding%20your%20Bake%20%26%20Joy%20order%20${o.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-[#D7EFFF] hover:bg-[#bfe2fa] text-[#351E28] transition-colors"
                          title="Chat with Customer on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl border-2 border-[#351E28] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#351E28]/10">
              <div>
                <span className="text-xs font-bold text-[#FF5C34] uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="font-heading font-black text-2xl text-[#351E28]">
                  {inspectingOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="w-8 h-8 rounded-full bg-[#F8F7F0] flex items-center justify-center text-[#351E28] hover:bg-[#351E28] hover:text-[#EAF05C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="p-4 bg-[#F8F7F0] rounded-2xl border border-[#351E28]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[#351E28]/60 font-semibold mb-0.5">Customer Name</div>
                <div className="font-bold text-[#351E28] text-sm">{inspectingOrder.customerName}</div>
                <div className="text-[#351E28]/70 mt-1">Phone: {inspectingOrder.customerPhone}</div>
                {inspectingOrder.customerWhatsapp && (
                  <div className="text-[#351E28]/70">WhatsApp: {inspectingOrder.customerWhatsapp}</div>
                )}
              </div>

              <div>
                <div className="text-[#351E28]/60 font-semibold mb-0.5">Pickup Preference</div>
                <div className="font-bold text-[#351E28]">{inspectingOrder.pickupPreference}</div>
                {inspectingOrder.notes && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-[#351E28]/10 text-[11px] text-[#351E28]/80">
                    <strong>Customer Notes:</strong> {inspectingOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Status Controllers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-2xl border-2 border-[#351E28]/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                  Workflow Status:
                </label>
                <select
                  value={inspectingOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(inspectingOrder.id, e.target.value as OrderStatus)}
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 rounded-xl p-2.5 text-xs font-bold text-[#351E28] outline-none"
                >
                  <option value="new">1. New Order</option>
                  <option value="pending">2. Pending Confirmation</option>
                  <option value="confirmed">3. Confirmed</option>
                  <option value="ready_for_pickup">4. Ready for Pickup</option>
                  <option value="completed">5. Collected / Completed</option>
                  <option value="cancelled">6. Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                  Payment Status:
                </label>
                <select
                  value={inspectingOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(inspectingOrder.id, e.target.value as PaymentStatus)}
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 rounded-xl p-2.5 text-xs font-bold text-[#351E28] outline-none"
                >
                  <option value="pending">Pending (Collect at counter)</option>
                  <option value="paid">Paid (Cash / UPI received)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3">
              <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#351E28]">
                Ordered Products
              </h3>
              <div className="divide-y divide-[#351E28]/10 border-y border-[#351E28]/10 py-1">
                {inspectingOrder.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img src={it.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-[#351E28]/10" />
                      )}
                      <div>
                        <div className="font-bold text-[#351E28]">{it.productName}</div>
                        {it.variantName && (
                          <div className="text-[10px] text-[#AEBBA0] font-semibold">{it.variantName}</div>
                        )}
                        <div className="text-[11px] text-[#351E28]/60">
                          {it.quantity} × ₹{it.unitPrice}
                        </div>
                      </div>
                    </div>

                    <div className="font-heading font-black text-sm text-[#351E28]">
                      ₹{it.lineTotal}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total */}
              <div className="p-4 bg-[#F8F7F0] rounded-2xl flex justify-between items-baseline">
                <span className="font-heading font-black text-sm text-[#351E28]">Total Order Amount:</span>
                <span className="font-heading font-black text-xl text-[#FF5C34]">₹{inspectingOrder.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <a
                href={`https://wa.me/${(inspectingOrder.customerWhatsapp || inspectingOrder.customerPhone).replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inspectingOrder.customerName)}%2C%20regarding%20your%20Bake%20%26%20Joy%20order%20${inspectingOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#D7EFFF] hover:bg-[#bfe2fa] text-[#351E28] font-bold text-xs px-5 py-3 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Customer on WhatsApp</span>
              </a>

              <button
                onClick={() => setInspectingOrder(null)}
                className="px-6 py-3 rounded-full bg-[#351E28] text-[#EAF05C] font-bold text-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
