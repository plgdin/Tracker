import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, ShoppingCart, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { profile } = useAuthStore();

  return (
    <div className="app-layout">
      <main className="main-content container">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/inventory" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <List size={24} />
          <span>Inventory</span>
        </NavLink>
        <NavLink 
          to="/shopping" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={24} />
          <span>Shopping</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
        {profile?.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Shield size={24} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
