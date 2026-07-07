import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Layout from './components/Layout';
import Toast from './components/Toast';
import { CartProvider } from './context/CartContext';
import StorefrontWrapper from './components/StorefrontWrapper';
import './index.css';

import AdminPortal from './pages/AdminPortal';

// Online Client
import Home from './pages/online/client/Home';
import Products from './pages/online/client/Products';
import Login from './pages/online/client/Login';
import Profile from './pages/online/client/Profile';
import ResetPassword from './pages/online/client/ResetPassword';
import Receipt from './pages/online/client/Receipt';
import Orders from './pages/online/client/Orders';

// Online Admin
import OnlineDashboard from './pages/online/admin/Dashboard';
import OnlineInventory from './pages/online/admin/Inventory';
import OnlineSettings from './pages/online/admin/Settings';
import OnlineAddItem from './pages/online/admin/AddItem';
import OnlineAdminDashboard from './pages/online/admin/AdminDashboard';
import OnlineLedger from './pages/online/admin/Ledger';

// Offline Admin
import OfflineDashboard from './pages/offline/Dashboard';
import OfflineInventory from './pages/offline/Inventory';
import OfflineSettings from './pages/offline/Settings';
import OfflineAddItem from './pages/offline/AddItem';
import OfflineAdminDashboard from './pages/offline/AdminDashboard';
import OfflineLedger from './pages/offline/Ledger';

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Storefront - Public/Client (Default to online) */}
        <Route element={<div className="storefront"><CartProvider><StorefrontWrapper /></CartProvider></div>}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/receipt" element={<Receipt />} />
        </Route>

        {/* Offline Admin */}
        <Route path="/adminoffline/*" element={
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
        } />

        {/* Online Admin */}
        <Route path="/adminonline/*" element={
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
        } />

        {/* Admin Hub / Portal */}
        <Route path="/admin" element={
          <AuthWrapper>
            <AdminPortal />
          </AuthWrapper>
        } />
        <Route path="/admin/*" element={
          <AuthWrapper>
            <AdminPortal />
          </AuthWrapper>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
