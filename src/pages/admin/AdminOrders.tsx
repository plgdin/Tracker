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
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A6153]/70">Fulfillment</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2818]">
          Customer Orders & In-Store Pickups
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5">
          Process Trivandrum counter pickups, coordinate WhatsApp communications, and manage order flow
        </p>
      </div>

      {/* Toolbar: Search and Status Tabs */}
      <div className="bg-white rounded-[2rem] p-4 border border-[#E8D8CC] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (BNJ-...), name or phone..."
              className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-[#4A2818] placeholder-[#7A6153]/50 outline-none focus:border-[#4A2818]"
            />
            <Search className="w-4 h-4 text-[#7A6153]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="text-xs font-serif font-bold text-[#7A6153] self-end sm:self-auto">
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
                className={`px-4 py-2 rounded-full text-xs transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#4A2818] text-[#F9F4EE] border-[#4A2818] font-serif font-bold shadow-sm'
                    : 'bg-[#FCFAF7] text-[#7A6153] border-[#E8D8CC] font-medium hover:bg-[#F2E7DC] hover:text-[#4A2818]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 opacity-70 text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2rem] border border-[#E8D8CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F4EE] border-b border-[#E8D8CC] text-[#7A6153] font-serif font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Order ID</th>
                <th className="py-4 px-4">Date & Time</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Pickup Preference</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Workflow Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D8CC]/50 text-[#4A2818]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7A6153]/60 font-serif italic text-sm">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FCFAF7] transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#4A2818]">
                      {o.orderNumber}
                    </td>
                    <td className="py-4 px-4 text-[#7A6153] font-medium whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-serif font-bold text-sm text-[#4A2818]">{o.customerName}</div>
                      <div className="text-[11px] text-[#7A6153]">{o.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#7A6153] max-w-[140px] truncate">
                      {o.pickupPreference}
                    </td>
                    <td className="py-4 px-4 font-serif font-bold text-sm text-[#4A2818]">
                      ₹{o.total}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-medium text-[10px] uppercase tracking-wider ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : o.paymentStatus === 'refunded'
                          ? 'bg-stone-100 text-stone-700 border border-stone-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value as OrderStatus)}
                        className={`text-xs font-serif font-semibold rounded-full px-3 py-1.5 border outline-none cursor-pointer ${
                          o.orderStatus === 'ready_for_pickup'
                            ? 'bg-[#F2E7DC] text-[#4A2818] border-[#4A2818]'
                            : o.orderStatus === 'confirmed'
                            ? 'bg-blue-50 text-blue-900 border-blue-200'
                            : o.orderStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-[#FCFAF7] text-[#4A2818] border-[#E8D8CC]'
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
                          className="p-2 rounded-full bg-[#FCFAF7] hover:bg-[#F2E7DC] text-[#4A2818] border border-[#E8D8CC] transition-colors"
                          title="Inspect Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://wa.me/${(o.customerWhatsapp || o.customerPhone).replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(o.customerName)}%2C%20regarding%20your%20Bake%20%26%20Joy%20order%20${o.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-[#F2E7DC] hover:bg-[#EAD9CF] text-[#4A2818] border border-[#E8D8CC] transition-colors"
                          title="Chat with Customer on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#361B0E]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl bg-[#FCFAF7] rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CC]">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6153]/70">
                  Order Details
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#4A2818]">
                  {inspectingOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="w-9 h-9 rounded-full bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] hover:bg-[#4A2818] hover:text-[#F9F4EE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="p-5 bg-white rounded-2xl border border-[#E8D8CC] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[#7A6153] font-medium mb-0.5">Customer Name</div>
                <div className="font-serif font-bold text-[#4A2818] text-base">{inspectingOrder.customerName}</div>
                <div className="text-[#7A6153] mt-1 font-mono">Phone: {inspectingOrder.customerPhone}</div>
                {inspectingOrder.customerWhatsapp && (
                  <div className="text-[#7A6153] font-mono">WhatsApp: {inspectingOrder.customerWhatsapp}</div>
                )}
              </div>

              <div>
                <div className="text-[#7A6153] font-medium mb-0.5">Pickup Preference</div>
                <div className="font-serif font-bold text-[#4A2818]">{inspectingOrder.pickupPreference}</div>
                {inspectingOrder.notes && (
                  <div className="mt-2 p-2.5 bg-[#FCFAF7] rounded-xl border border-[#E8D8CC] text-[11px] text-[#7A6153]">
                    <strong className="text-[#4A2818]">Customer Notes:</strong> {inspectingOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Status Controllers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-white rounded-2xl border border-[#E8D8CC]">
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                  Workflow Status:
                </label>
                <select
                  value={inspectingOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(inspectingOrder.id, e.target.value as OrderStatus)}
                  className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-xl p-2.5 text-xs font-serif font-semibold text-[#4A2818] outline-none"
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
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                  Payment Status:
                </label>
                <select
                  value={inspectingOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(inspectingOrder.id, e.target.value as PaymentStatus)}
                  className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-xl p-2.5 text-xs font-serif font-semibold text-[#4A2818] outline-none"
                >
                  <option value="pending">Pending (Collect at counter)</option>
                  <option value="paid">Paid (Cash / UPI received)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#4A2818]">
                Ordered Products
              </h3>
              <div className="divide-y divide-[#E8D8CC] border-y border-[#E8D8CC] py-1">
                {inspectingOrder.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {it.image && (
                        <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-[#E8D8CC]" />
                      )}
                      <div>
                        <div className="font-serif font-bold text-sm text-[#4A2818]">{it.productName}</div>
                        {it.variantName && (
                          <div className="text-[10px] text-[#7A6153] font-medium">{it.variantName}</div>
                        )}
                        <div className="text-[11px] text-[#7A6153]">
                          {it.quantity} × ₹{it.unitPrice}
                        </div>
                      </div>
                    </div>

                    <div className="font-serif font-bold text-base text-[#4A2818]">
                      ₹{it.lineTotal}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total */}
              <div className="p-4 bg-[#F2E7DC] rounded-2xl flex justify-between items-baseline border border-[#E8D8CC]">
                <span className="font-serif font-bold text-sm text-[#4A2818]">Total Order Amount:</span>
                <span className="font-serif font-bold text-2xl text-[#4A2818]">₹{inspectingOrder.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${(inspectingOrder.customerWhatsapp || inspectingOrder.customerPhone).replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inspectingOrder.customerName)}%2C%20regarding%20your%20Bake%20%26%20Joy%20order%20${inspectingOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs px-6 py-3 rounded-full transition-all active:scale-95 shadow-md w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Customer on WhatsApp</span>
              </a>

              <button
                onClick={() => setInspectingOrder(null)}
                className="px-6 py-3 rounded-full bg-[#F2E7DC] text-[#4A2818] hover:bg-[#EAD9CF] font-serif font-bold text-xs w-full sm:w-auto"
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
