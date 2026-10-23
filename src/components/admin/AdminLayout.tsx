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
    <div className="min-h-screen bg-[#F8F7F0] flex font-body selection:bg-[#EAF05C]">
      
      {/* Cassis Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#351E28] text-white shrink-0 border-r border-[#351E28]/20">
        <div>
          {/* Brand Logo & Tag */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF05C] text-[#351E28] flex items-center justify-center shadow-md">
              <Cake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-heading font-black text-xl text-white tracking-tight leading-tight">
                Bake & Joy
              </div>
              <div className="text-[10px] font-bold text-[#EAF05C] uppercase tracking-wider">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#FF5C34] text-white shadow-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
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
        <div className="p-4 border-t border-white/10 space-y-3">
          
          {/* Demo User Pill */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EAF05C] text-[#351E28] font-black text-xs flex items-center justify-center">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Demo Store Manager</div>
              <div className="text-[10px] text-[#AEBBA0] truncate">{user?.email || 'admin@demo.com'}</div>
            </div>
          </div>

          {/* View Customer Storefront */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#EAF05C]" />
            <span>View Live Storefront</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#351E28]/10 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-xl text-[#351E28] hover:bg-[#F8F7F0]"
            >
              {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-heading font-black text-lg text-[#351E28]">
              Bake & Joy Bangalore · Store Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#EAF05C] text-[#351E28] text-xs font-black px-3 py-1 rounded-full border border-[#351E28]/15 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-[#351E28]" />
              <span>Demo Mock Data Engine Active</span>
            </div>

            <Link
              to="/"
              className="text-xs font-bold text-[#FF5C34] hover:text-[#e44c26] transition-colors flex items-center gap-1"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-[#351E28] text-white p-4 border-b border-white/10 space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs ${
                    isActive ? 'bg-[#FF5C34] text-white' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <Link to="/" className="text-[#EAF05C] font-bold">Visit Storefront</Link>
              <button onClick={handleLogout} className="text-red-400 font-bold">Sign Out</button>
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
