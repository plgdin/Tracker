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
          <h1 className="font-serif text-3xl font-bold text-[#4A2818]">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5 font-normal">
            Real-time bakery store metrics and counter pickup pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetCatalog}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#E8D8CC] bg-[#FCFAF7] hover:bg-[#F2E7DC] text-xs font-semibold text-[#4A2818] transition-all"
            title="Reset to default mock data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] text-xs font-serif font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Total Products */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Products</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {totalProducts}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              {activeProducts} active
            </div>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Orders</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {totalOrders}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')} vol
            </div>
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Pending</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {pendingOrders}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              Needs check
            </div>
          </div>
        </div>

        {/* 4. Confirmed Orders */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Confirmed</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {confirmedOrders}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              In packing
            </div>
          </div>
        </div>

        {/* 5. Ready for Pickup */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Pickup Ready</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {readyOrders}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              At counter
            </div>
          </div>
        </div>

        {/* 6. Completed Orders */}
        <div className="bg-white rounded-[1.75rem] p-4 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#7A6153] mb-2">
            <span>Completed</span>
            <div className="w-7 h-7 rounded-xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="font-serif font-bold text-2xl text-[#4A2818]">
              {completedOrders}
            </div>
            <div className="text-[10px] text-[#7A6153] mt-0.5">
              Collected
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Section with Status Controls */}
      <div className="bg-white rounded-[2rem] border border-[#E8D8CC] shadow-xs overflow-hidden">
        
        <div className="p-5 sm:p-6 border-b border-[#E8D8CC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFAF7]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#4A2818]">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-[#7A6153] mt-0.5">
              Live orders submitted through WhatsApp checkout flow
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-[#4A2818] hover:text-[#673D26] transition-colors flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F4EE] border-b border-[#E8D8CC] text-[#7A6153] font-serif font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#E8D8CC]/50 text-[#4A2818]">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#F9F4EE]/40 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-serif font-bold text-[#4A2818]">
                    {order.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-[11px] text-[#7A6153]">{order.customerPhone}</div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-[#7A6153] max-w-[150px] truncate">
                    {order.pickupPreference}
                  </td>
                  <td className="py-4 px-4 font-medium text-[#7A6153]">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-4 px-4 font-serif font-bold text-sm text-[#4A2818]">
                    ₹{order.total}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold rounded-full px-3 py-1 bg-[#F2E7DC] text-[#4A2818] border border-[#E8D8CC] outline-none cursor-pointer"
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
                      className="inline-flex items-center gap-1 bg-[#F2E7DC] hover:bg-[#E8D8CC] text-[#4A2818] font-medium text-[11px] px-3 py-1.5 rounded-full transition-colors"
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
