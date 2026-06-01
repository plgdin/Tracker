import { Outlet, NavLink } from 'react-router-dom';
import { Home, List, ShoppingCart, Settings } from 'lucide-react';

export default function Layout() {
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
      </nav>
    </div>
  );
}
