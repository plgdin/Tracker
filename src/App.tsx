import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import AddItem from './pages/AddItem';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import Ledger from './pages/Ledger';
import Toast from './components/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import { CartProvider } from './context/CartContext';
import { Outlet } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Standalone — accessible without being logged in */}
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Storefront - Public/Client */}
        <Route element={<div className="storefront"><CartProvider><Outlet /></CartProvider></div>}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* All other routes are protected by AuthWrapper (Staff/Admin area) */}
        <Route path="/*" element={
          <AuthWrapper>
            <Routes>
              <Route path="/admin" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="settings" element={<Settings />} />
                <Route path="add-item" element={<AddItem />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="ledger" element={<Ledger />} />
              </Route>
            </Routes>
          </AuthWrapper>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
