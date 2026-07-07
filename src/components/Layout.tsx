import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, List, Settings, Shield, LogOut, BookOpen, Globe, Store } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import '../admin.css';

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const { storeType, setStoreType } = useAppStore();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isOnlineAdmin = location.pathname.startsWith('/adminonline');

  return (
    <div className="app-layout">
      {/* Top bar with logout */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        gap: '0.75rem'
      }}>
        {isOnlineAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(230, 57, 70, 0.05)',
            borderRadius: '20px',
            padding: '2px',
            marginRight: 'auto',
            border: '1px solid rgba(230, 57, 70, 0.1)'
          }}>
            <button
              onClick={() => setStoreType('online')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: storeType === 'online' ? 'var(--color-primary)' : 'transparent',
                color: storeType === 'online' ? 'white' : 'var(--color-text-secondary)',
                padding: '0.35rem 0.85rem',
                borderRadius: '18px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              <Globe size={13} />
              Online
            </button>
            <button
              onClick={() => setStoreType('offline')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: storeType === 'offline' ? 'var(--color-primary)' : 'transparent',
                color: storeType === 'offline' ? 'white' : 'var(--color-text-secondary)',
                padding: '0.35rem 0.85rem',
                borderRadius: '18px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              <Store size={13} />
              Offline
            </button>
          </div>
        )}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--color-text-secondary)',
              background: 'rgba(230, 57, 70, 0.06)',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              {profile.role === 'admin' ? '🛡️' : '👤'} {profile.name || 'User'}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--color-primary)',
                border: 'none',
                color: 'white',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(230, 57, 70, 0.25)'
              }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        )}
      </div>

      <main className="main-content container">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink 
          to="." 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <Home size={24} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="inventory" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <List size={24} />
          <span>Inventory</span>
        </NavLink>
        <NavLink 
          to="settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
        {profile?.role === 'admin' && (
          <NavLink 
            to="dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Shield size={24} />
            <span>Admin</span>
          </NavLink>
        )}
        {profile?.role === 'admin' && (
          <NavLink 
            to="ledger" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={24} />
            <span>Ledger</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
