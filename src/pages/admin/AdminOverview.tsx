import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  ArrowRight, 
  Plus, 
  MessageCircle, 
  RotateCcw
} from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import type { Product, Order, OrderStatus } from '../../types/ecommerce';

export default function AdminOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = async () => {
    const [p, o] = await Promise.all([
      productService.getAll(),
      orderService.getAll(),
    ]);
    setProducts(p);
    setOrders(o);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'new' || o.orderStatus === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'confirmed').length;
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready_for_pickup').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateStatus(orderId, newStatus);
    loadData();
  };

  const handleResetCatalog = async () => {
    if (confirm('Reset all products and orders to initial demo catalog?')) {
      await productService.resetToDefaults();
      await orderService.resetToDefaults();
      loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-[#351E28]">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#351E28]/70 mt-0.5">
            Real-time frontend performance metrics and pickup pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCatalog}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#351E28]/20 bg-white hover:bg-[#F8F7F0] text-xs font-bold text-[#351E28] transition-all"
            title="Reset to default mock data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards as specified in Section 5.B */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Total Products */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Products</span>
            <div className="w-7 h-7 rounded-lg bg-[#D7EFFF] text-[#351E28] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-[#351E28]">
              {totalProducts}
            </div>
            <div className="text-[10px] font-semibold text-[#AEBBA0] mt-0.5">
              {activeProducts} active
            </div>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Orders</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF05C] text-[#351E28] flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-[#351E28]">
              {totalOrders}
            </div>
            <div className="text-[10px] font-semibold text-[#FF5C34] mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')} vol
            </div>
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-amber-600">
              {pendingOrders}
            </div>
            <div className="text-[10px] font-semibold text-[#351E28]/50 mt-0.5">
              Needs check
            </div>
          </div>
        </div>

        {/* 4. Confirmed Orders */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Confirmed</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-blue-700">
              {confirmedOrders}
            </div>
            <div className="text-[10px] font-semibold text-[#351E28]/50 mt-0.5">
              In packing
            </div>
          </div>
        </div>

        {/* 5. Ready for Pickup */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Pickup Ready</span>
            <div className="w-7 h-7 rounded-lg bg-[#EAF05C] text-[#351E28] flex items-center justify-center">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-[#351E28]">
              {readyOrders}
            </div>
            <div className="text-[10px] font-semibold text-[#AEBBA0] mt-0.5">
              At counter
            </div>
          </div>
        </div>

        {/* 6. Completed Orders */}
        <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#351E28]/60 mb-2">
            <span>Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-heading font-black text-2xl text-emerald-700">
              {completedOrders}
            </div>
            <div className="text-[10px] font-semibold text-[#351E28]/50 mt-0.5">
              Collected
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Section with Status Controls */}
      <div className="bg-white rounded-3xl border-2 border-[#351E28]/10 shadow-sm overflow-hidden">
        
        <div className="p-5 sm:p-6 border-b border-[#351E28]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-black text-xl text-[#351E28]">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#351E28]/60 mt-0.5">
              Live orders submitted through WhatsApp checkout flow
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#FF5C34] hover:text-[#e44c26] transition-colors flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F0] border-b border-[#351E28]/10 text-[#351E28]/70 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Pickup Slot</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#351E28]/5 text-[#351E28]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#F8F7F0]/60 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-mono font-bold text-[#FF5C34]">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold">{order.customerName}</div>
                    <div className="text-[11px] text-[#351E28]/60">{order.customerPhone}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-[#351E28]/80 max-w-[150px] truncate">
                    {order.pickupPreference}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#351E28]/70">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-4 px-4 font-heading font-black text-sm">
                    ₹{order.total}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${
                        order.orderStatus === 'ready_for_pickup'
                          ? 'bg-[#EAF05C] text-[#351E28] border-[#351E28]'
                          : order.orderStatus === 'confirmed'
                          ? 'bg-[#D7EFFF] text-[#351E28] border-blue-300'
                          : order.orderStatus === 'completed'
                          ? 'bg-[#AEBBA0]/30 text-[#351E28] border-[#AEBBA0]'
                          : 'bg-[#F8F7F0] text-[#351E28] border-[#351E28]/20'
                      }`}
                    >
                      <option value="new">New Order</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <a
                      href={`https://wa.me/${(order.customerWhatsapp || order.customerPhone).replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)}%2C%20regarding%20your%20Bake%20%26%20Joy%20order%20${order.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-[#D7EFFF] hover:bg-[#bfe2fa] text-[#351E28] font-bold text-[11px] px-3 py-1.5 rounded-full transition-colors"
                      title="Message customer on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
