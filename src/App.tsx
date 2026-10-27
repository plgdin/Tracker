import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Toast from './components/Toast';
import './index.css';

// Current Storefront Frontend
import Home from './pages/Home';
import Products from './pages/Products';
import { MobileBottomNav } from './components/storefront/MobileBottomNav';
import { FloatingSearch } from './components/storefront/FloatingSearch';

// Exact Backend / Admin from stanes
import AuthWrapper from './components/AuthWrapper';
import Layout from './components/Layout';
import AdminPortal from './pages/AdminPortal';

// Online Admin from stanes
import OnlineDashboard from './pages/online/admin/Dashboard';
import OnlineInventory from './pages/online/admin/Inventory';
import OnlineSettings from './pages/online/admin/Settings';
import OnlineAddItem from './pages/online/admin/AddItem';
import OnlineAdminDashboard from './pages/online/admin/AdminDashboard';
import OnlineLedger from './pages/online/admin/Ledger';

// Offline Admin from stanes
import OfflineDashboard from './pages/offline/Dashboard';
import OfflineInventory from './pages/offline/Inventory';
import OfflineSettings from './pages/offline/Settings';
import OfflineAddItem from './pages/offline/AddItem';
import OfflineAdminDashboard from './pages/offline/AdminDashboard';
import OfflineLedger from './pages/offline/Ledger';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toast />
        <Routes>
          {/* Public Customer Storefront Routes */}
          <Route
            path="/"
            element={
              <>
                <MobileBottomNav />
                <FloatingSearch />
                <Home />
              </>
            }
          />
          <Route
            path="/products"
            element={
              <>
                <MobileBottomNav />
                <FloatingSearch />
                <Products />
              </>
            }
          />

          {/* Offline Admin from stanes */}
          <Route
            path="/adminoffline/*"
            element={
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<OfflineDashboard />} />
                    <Route path="inventory" element={<OfflineInventory />} />
                    <Route path="settings" element={<OfflineSettings />} />
                    <Route path="add-item" element={<OfflineAddItem />} />
                    <Route path="dashboard" element={<OfflineAdminDashboard />} />
                    <Route path="ledger" element={<OfflineLedger />} />
                  </Route>
                </Routes>
              </AuthWrapper>
            }
          />

          {/* Online Admin from stanes */}
          <Route
            path="/adminonline/*"
            element={
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<OnlineDashboard />} />
                    <Route path="inventory" element={<OnlineInventory />} />
                    <Route path="settings" element={<OnlineSettings />} />
                    <Route path="add-item" element={<OnlineAddItem />} />
                    <Route path="dashboard" element={<OnlineAdminDashboard />} />
                    <Route path="ledger" element={<OnlineLedger />} />
                  </Route>
                </Routes>
              </AuthWrapper>
            }
          />

          {/* Admin Hub / Portal from stanes */}
          <Route
            path="/admin"
            element={
              <AuthWrapper>
                <AdminPortal />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AuthWrapper>
                <AdminPortal />
              </AuthWrapper>
            }
          />

          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
