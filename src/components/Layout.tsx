import { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  List, 
  Settings, 
  Shield, 
  LogOut, 
  BookOpen, 
  Store, 
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import '../admin.css';

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const { storeType, setStoreType } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnline = location.pathname.includes('/adminonline');
  const basePath = isOnline ? '/adminonline' : '/adminoffline';
  const otherPath = isOnline ? '/adminoffline' : '/adminonline';

  // Automatically keep the global storeType synchronized with the active route
  useEffect(() => {
    const targetStore = isOnline ? 'online' : 'offline';
    if (storeType !== targetStore) {
      setStoreType(targetStore);
    }
  }, [isOnline, storeType, setStoreType]);

  // Extract current subpath to preserve page when switching panels (e.g. /inventory)
  const currentSubpath = location.pathname.replace(basePath, '') || '';

  const handleSwitchMode = () => {
    const target = isOnline ? 'offline' : 'online';
    setStoreType(target);
    navigate(`${otherPath}${currentSubpath}`);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="app-layout min-h-screen flex flex-col bg-[#FDFBF7]">
      {/* Top Header Bar - NayaKart signature chocolate espresso & warm cream */}
      <header className="sticky top-0 z-40 bg-[#361B0E] border-b border-[#522914] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            {/* Left: NayaKart Brand Identity matching storefront */}
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2.5 group cursor-pointer"
                title="View live NayaKart storefront"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif font-normal italic text-2xl sm:text-3xl tracking-tight text-[#F9F4EE] group-hover:text-[#EAD9CF] transition-colors leading-none">
                    NayaKart
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isOnline 
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60' 
                      : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {isOnline ? 'Online Store' : 'Offline Counter'}
                  </span>
                </div>
              </a>
            </div>

            {/* Middle: Store Switcher & Storefront link */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Segmented Switcher */}
              <div className="inline-flex p-1 bg-[#27130A] rounded-xl border border-[#522914]">
                <button
                  type="button"
                  onClick={() => !isOnline && handleSwitchMode()}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    isOnline
                      ? 'bg-[#4A2818] text-[#F9F4EE] font-semibold shadow-xs border border-[#8B4513]/60'
                      : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'
                  }`}
                  title="Switch to Online Store Admin"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => isOnline && handleSwitchMode()}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    !isOnline
                      ? 'bg-[#4A2818] text-[#F9F4EE] font-semibold shadow-xs border border-[#8B4513]/60'
                      : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'
                  }`}
                  title="Switch to Offline Counter Admin"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Offline</span>
                </button>
              </div>

              {/* View Public Storefront */}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F9F4EE] bg-[#4A2818] hover:bg-[#5C2E17] border border-[#6B371E] rounded-xl transition-colors"
                title="Open live customer storefront in new tab"
              >
                <Store size={14} className="text-[#D4A373]" />
                <span>Storefront</span>
                <ExternalLink size={11} className="opacity-60" />
              </a>
            </div>

            {/* Right: User Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {profile && (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-[#F9F4EE]">
                      {profile.name || 'Staff Member'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#D4A373] font-bold">
                      {profile.role === 'admin' ? 'Super Admin' : 'Staff'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#4A2818] border border-[#6B371E] flex items-center justify-center text-xs font-bold text-[#F9F4EE]">
                    {profile.role === 'admin' ? '🛡️' : '👤'}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F9F4EE] hover:text-white bg-[#4A2818] hover:bg-[#8B4513] border border-[#6B371E] rounded-xl transition-all duration-150 shadow-xs cursor-pointer"
                title="Sign out of admin"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Focused & Uncluttered (No duplicate action buttons) */}
          <div className="hidden md:flex items-center gap-1.5 py-2.5 border-t border-[#522914]">
            <NavLink
              to="."
              end
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#C87D55] text-white shadow-xs'
                    : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                }`
              }
            >
              <Home size={15} />
              <span>Dashboard</span>
            </NavLink>

            {isOnline && profile?.role === 'admin' && (
              <NavLink
                to="orders"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive || location.pathname.endsWith('/orders') || (location.pathname.includes('dashboard') && location.search.includes('tab=orders'))
                      ? 'bg-[#C87D55] text-white shadow-xs'
                      : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                  }`
                }
              >
                <ShoppingCart size={15} />
                <span>Orders</span>
              </NavLink>
            )}

            <NavLink
              to="inventory"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#C87D55] text-white shadow-xs'
                    : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                }`
              }
            >
              <List size={15} />
              <span>Inventory</span>
            </NavLink>

            {!isOnline && profile?.role === 'admin' && (
              <NavLink
                to="ledger"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#C87D55] text-white shadow-xs'
                      : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                  }`
                }
              >
                <BookOpen size={15} />
                <span>Ledger</span>
              </NavLink>
            )}

            {profile?.role === 'admin' && (
              <NavLink
                to="dashboard"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive && !location.pathname.endsWith('/orders') && (!isOnline || !location.search.includes('tab=orders'))
                      ? 'bg-[#C87D55] text-white shadow-xs'
                      : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                  }`
                }
              >
                <Shield size={15} />
                <span>Admin Desk</span>
              </NavLink>
            )}

            <NavLink
              to="settings"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#C87D55] text-white shadow-xs'
                    : 'text-[#D4A373] hover:text-[#F9F4EE] hover:bg-[#4A2818]'
                }`
              }
            >
              <Settings size={15} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile-Only Bottom Navigation - iOS Safe Area Aware & HIG Compliant Touch Targets */}
      <nav 
        aria-label="Admin Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#361B0E]/95 backdrop-blur-lg border-t border-[#522914] shadow-2xl flex items-center justify-around pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-2"
      >
        <NavLink 
          to="." 
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
          end
        >
          <Home size={19} />
          <span>Dashboard</span>
        </NavLink>

        {isOnline && profile?.role === 'admin' ? (
          <NavLink 
            to="orders" 
            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive || location.pathname.endsWith('/orders') || location.search.includes('tab=orders') ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
          >
            <ShoppingCart size={19} />
            <span>Orders</span>
          </NavLink>
        ) : !isOnline && profile?.role === 'admin' ? (
          <NavLink 
            to="ledger" 
            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
          >
            <BookOpen size={19} />
            <span>Ledger</span>
          </NavLink>
        ) : null}

        <NavLink 
          to="inventory" 
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
        >
          <List size={19} />
          <span>Inventory</span>
        </NavLink>

        {profile?.role === 'admin' && (
          <NavLink 
            to="dashboard" 
            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive && !location.pathname.endsWith('/orders') && !location.search.includes('tab=orders') ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
          >
            <Shield size={19} />
            <span>Admin</span>
          </NavLink>
        )}

        <NavLink 
          to="settings" 
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] gap-1 text-[11px] font-semibold transition-colors ${isActive ? 'text-[#EAD9CF]' : 'text-[#D4A373]/70 hover:text-[#F9F4EE]'}`}
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
