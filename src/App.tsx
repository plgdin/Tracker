import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Layout from './components/Layout';
import { useAuthStore } from './store/authStore';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import AddItem from './pages/AddItem';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import Ledger from './pages/Ledger';
import Storefront from './pages/Storefront';
import Toast from './components/Toast';
import './index.css';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  if (profile?.role === 'client') {
    return <Navigate to="/store" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Standalone — accessible without being logged in */}
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Layout wraps everything so the navbar persists */}
        <Route element={<Layout />}>
          {/* Public Storefront */}
          <Route path="/store" element={<Storefront />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <AuthWrapper>
              <AdminRoute>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="add-item" element={<AddItem />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="ledger" element={<Ledger />} />
                </Routes>
              </AdminRoute>
            </AuthWrapper>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
