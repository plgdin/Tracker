import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/app-1-utils/sidebar';
import { App1Sidebar } from '@/components/ui/app-1-utils/app-1-sidebar';
import { app1User } from '@/components/ui/app-1-utils/app-1-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  ExternalLink, 
  Bell, 
  Clock,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/ecommerce';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const all = await orderService.getAll();
        const pending = all.filter(
          (o) => o.orderStatus === 'new' || o.orderStatus === 'pending' || o.orderStatus === 'confirmed'
        );
        setPendingOrders(pending);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const pageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard & Counter Ops';
    if (path.includes('/products')) return 'Products Catalog';
    if (path.includes('/categories')) return 'Categories Management';
    if (path.includes('/orders')) return 'Orders & Pickup Desk';
    if (path.includes('/settings')) return 'Store Configuration';
    return 'Admin Console';
  };

  return (
    <SidebarProvider>
      <App1Sidebar />
      <SidebarInset className="min-w-0 bg-[#FCFAF7] min-h-screen flex flex-col">
        {/* Sticky Premium Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8D8CC] bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger aria-label="Toggle navigation" />
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6153]/70 hidden sm:inline">
                  NayaKart Kazhakuttam
                </span>
                <span className="text-[#E8D8CC] hidden sm:inline">•</span>
                <h1 className="truncate text-sm sm:text-base font-serif font-bold text-[#4A2818]">
                  {pageTitle()}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Counter Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-[#F2E7DC]/60 border border-[#E8D8CC] px-3 py-1 rounded-full text-xs font-medium text-[#4A2818]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Kazhakuttam Counter Active</span>
            </div>

            {/* Quick View Storefront Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-xs font-medium border-[#E8D8CC] hover:bg-[#F2E7DC] text-[#4A2818] gap-1.5 shadow-2xs"
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <Store className="size-3.5 text-[#4A2818]" />
                <span className="hidden sm:inline">Live Storefront</span>
                <ExternalLink className="size-3 text-[#7A6153]" />
              </Link>
            </Button>

            {/* Notifications Popover */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full size-8 text-[#7A6153] hover:text-[#4A2818] hover:bg-[#F2E7DC]"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {pendingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#FF5C34] text-[10px] font-bold text-white shadow-xs">
                    {pendingOrders.length}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E8D8CC] shadow-xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8D8CC]">
                      <div className="font-serif font-bold text-[#4A2818] text-sm">
                        Pending Orders ({pendingOrders.length})
                      </div>
                      <Link 
                        to="/admin/orders" 
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-medium text-[#4A2818] hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    {pendingOrders.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#7A6153]">
                        <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        All counter orders are packed and up to date!
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {pendingOrders.slice(0, 4).map((order) => (
                          <Link
                            key={order.id}
                            to="/admin/orders"
                            onClick={() => setShowNotifications(false)}
                            className="block p-2.5 rounded-xl bg-[#FDFBF7] hover:bg-[#F2E7DC]/60 border border-[#E8D8CC]/60 transition-colors"
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-mono font-bold text-[#4A2818]">
                                {order.orderNumber}
                              </span>
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {order.orderStatus.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-xs text-[#4A2818] font-medium truncate">
                              {order.customerName}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#7A6153] mt-1">
                              <span className="truncate">{order.pickupPreference}</span>
                              <span className="font-bold text-[#4A2818]">₹{order.total}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#E8D8CC]">
              <Avatar className="size-8 border border-[#E8D8CC]">
                <AvatarImage
                  src={app1User.avatar}
                  alt={app1User.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#4A2818] text-[#F9F4EE] text-xs font-bold">
                  {app1User.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-[#4A2818] leading-tight">
                  {app1User.name}
                </span>
                <span className="text-[10px] text-[#7A6153]">
                  Store Manager
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
