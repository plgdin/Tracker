import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, ClipboardList, Settings, LogOut, ChefHat } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="admin-layout">
      {/* Dark Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo-area">
          <div className="admin-logo-icon">
            <ChefHat size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="admin-logo-text">Bake & Joy</h2>
            <span className="admin-logo-sub">Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} /> Orders
          </NavLink>
          <NavLink to="/ledger" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} /> Invoices
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={20} /> Audit Logs
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}>
            <LogOut size={20} /> Logout
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            {window.location.host}{window.location.pathname}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
