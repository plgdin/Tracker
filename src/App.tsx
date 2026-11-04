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

// Admin Components
import AdminDashboardView from './components/admin/Dashboard';
import AdminInventory from './components/admin/Inventory';
import AdminSettings from './components/admin/Settings';
import AdminAddItem from './components/admin/AddItem';
import AdminManagementDesk from './components/admin/AdminDashboard';
import AdminLedger from './components/admin/Ledger';

import Profile from './pages/Profile';
import Receipt from './pages/Receipt';
import TermsAndConditions from './pages/TermsAndConditions';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
          <Route
            path="/profile"
            element={
              <>
                <MobileBottomNav />
                <Profile />
              </>
            }
          />
          <Route
            path="/receipt"
            element={<Receipt />}
          />
          <Route
            path="/terms"
            element={
              <>
                <MobileBottomNav />
                <TermsAndConditions />
              </>
            }
          />

          {/* Offline Admin (Counter / POS) */}
          <Route
            path="/adminoffline/*"
            element={
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<AdminDashboardView />} />
                    <Route path="orders" element={<Navigate to="../dashboard" replace />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="add-item" element={<AdminAddItem />} />
                    <Route path="dashboard" element={<AdminManagementDesk isOrdersOnly={false} />} />
                    <Route path="ledger" element={<AdminLedger />} />
                  </Route>
                </Routes>
              </AuthWrapper>
            }
          />

          {/* Online Admin (Storefront Management) */}
          <Route
            path="/adminonline/*"
            element={
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<AdminDashboardView />} />
                    <Route path="orders" element={<AdminManagementDesk isOrdersOnly={true} />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="add-item" element={<AdminAddItem />} />
                    <Route path="dashboard" element={<AdminManagementDesk isOrdersOnly={false} />} />
                    <Route path="ledger" element={<AdminLedger />} />
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
