import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useCartContext } from '../../../context/CartContext';
import { useAuthStore } from '../../../store/authStore';
import { db } from '../../../lib/db';
import type { OnlineOrder } from '../../../lib/db';

export default function Orders() {
  const navigate = useNavigate();
  const { setIsCartOpen } = useCartContext();
  const { user } = useAuthStore();
  
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for UTR submission per order
  const [utrInputs, setUtrInputs] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await db.getUserOrders(user.id);
        setOrders(data);
      } catch (e) {
        console.error('Failed to fetch orders', e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleUtrSubmit = async (orderId: string) => {
    const utr = utrInputs[orderId];
    if (!utr || !utr.trim()) return;
    
    setSubmittingId(orderId);
    const success = await db.updateOrderTransactionId(orderId, utr.trim());
    if (success) {
      // Refresh orders
      const data = await db.getUserOrders(user!.id);
      setOrders(data);
    }
    setSubmittingId(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] font-sans pb-24">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={""}
        setSearchQuery={() => {}}
        selectedCategory={undefined}
        setSelectedCategory={() => {}}
        categories={[]}
        inStockOnly={false}
        setInStockOnly={() => {}}
      />

      <div className="max-w-3xl mx-auto pt-24 px-4 md:pt-32">
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-espresso/10 flex items-center justify-center hover:bg-espresso/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-espresso" />
          </button>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-espresso">Order History</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-burnt-orange"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-espresso/10 shadow-sm">
            <Package className="w-16 h-16 text-espresso/20 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-espresso mb-2">No orders yet</h2>
            <p className="text-espresso/60 mb-6">Looks like you haven't made any purchases.</p>
            <button 
              onClick={() => navigate('/')}
              className="text-espresso font-bold text-lg hover:text-burnt-orange hover:-translate-y-1 transition-all duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-espresso/10 p-5 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-espresso/5">
                  <div>
                    <span className="text-xs font-bold text-burnt-orange mb-1 block">
                      {new Date(order.created_at || '').toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <h3 className="font-mono text-sm font-bold text-espresso/80">{order.id}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-espresso">₹{order.total_amount}</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-bold text-espresso/60 uppercase tracking-wider mb-2">Items</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span><span className="font-medium">{item.quantity}x</span> {item.name}</span>
                        <span className="text-espresso/60">₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* UTR Submission Section */}
                <div className="bg-[#FFF8F6] rounded-xl p-4 border border-burnt-orange/10">
                  {order.transaction_id ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold">Transaction ID: {order.transaction_id}</span>
                    </div>
                  ) : order.status !== 'cancelled' ? (
                    <div>
                      <p className="text-xs text-espresso/70 font-medium mb-2">Payment Verification Required. Please submit your UPI Transaction ID (UTR).</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="12-digit UTR No."
                          value={utrInputs[order.id] || ''}
                          onChange={(e) => setUtrInputs({...utrInputs, [order.id]: e.target.value})}
                          className="flex-1 bg-white text-espresso text-sm border border-espresso/20 rounded-lg px-3 py-2 outline-none focus:border-burnt-orange"
                        />
                        <button 
                          onClick={() => handleUtrSubmit(order.id)}
                          disabled={submittingId === order.id || !(utrInputs[order.id] || '').trim()}
                          className="bg-burnt-orange hover:bg-[#C44D2A] text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center disabled:opacity-50 transition-colors"
                        >
                          {submittingId === order.id ? '...' : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
