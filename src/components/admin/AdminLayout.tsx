import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Cake, 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  ClipboardList, 
  Settings as SettingsIcon, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { authService } from '../../services/authService';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const user = authService.getSession();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders & Pickup', path: '/admin/orders', icon: ClipboardList },
    { label: 'Store Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F9F4EE] flex font-sans selection:bg-[#EAD9CF] selection:text-[#4A2818]">
      
      {/* Warm Dark Cocoa Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#361B0E] text-[#F9F4EE] shrink-0 border-r border-[#4A2818]">
        <div>
          {/* Brand Logo & Tag */}
          <div className="p-6 border-b border-[#4A2818] flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center shadow-sm">
              <Cake className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-serif font-bold text-xl text-[#F9F4EE] tracking-tight leading-tight italic">
                Bake & Joy
              </div>
              <div className="text-[10px] font-semibold text-[#F2E7DC]/80 uppercase tracking-wider">
                Admin Console
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-[#4A2818] text-[#F9F4EE] shadow-sm border border-[#673D26]'
                      : 'text-[#F9F4EE]/70 hover:bg-white/10 hover:text-[#F9F4EE]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Status & Bottom Actions */}
        <div className="p-4 border-t border-[#4A2818] space-y-3">
          
          {/* Demo User Pill */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F2E7DC] text-[#4A2818] font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#F9F4EE] truncate">Store Manager</div>
              <div className="text-[10px] text-[#F9F4EE]/60 truncate">{user?.email || 'admin@demo.com'}</div>
            </div>
          </div>

          {/* View Customer Storefront */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-[#F9F4EE] font-medium text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F2E7DC]" />
            <span>View Live Storefront</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-[#FCFAF7] border-b border-[#E8D8CC] h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl text-[#4A2818] hover:bg-[#F2E7DC]"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-serif font-bold text-lg text-[#4A2818]">
              Bake & Joy Bangalore · Store Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#F2E7DC] text-[#4A2818] text-xs font-medium px-3.5 py-1 rounded-full border border-[#E8D8CC]">
              <Sparkles className="w-3.5 h-3.5 fill-[#4A2818]" />
              <span>Mock Engine Active</span>
            </div>

            <Link
              to="/"
              className="text-xs font-semibold text-[#4A2818] hover:text-[#673D26] transition-colors flex items-center gap-1"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-[#361B0E] text-[#F9F4EE] p-4 border-b border-[#4A2818] space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs ${
                    isActive ? 'bg-[#4A2818] text-[#F9F4EE]' : 'text-[#F9F4EE]/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#4A2818] flex justify-between items-center text-xs">
              <Link to="/" className="text-[#F2E7DC] font-semibold">Visit Storefront</Link>
              <button onClick={handleLogout} className="text-red-300 font-semibold">Sign Out</button>
            </div>
          </div>
        )}

        {/* Router Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
