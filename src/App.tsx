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
import Orders from './pages/Orders';
import Storefront from './pages/Storefront';
import Toast from './components/Toast';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Standalone — accessible without being logged in */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/store" element={<Storefront />} />

        {/* All other routes are protected by AuthWrapper */}
        <Route path="/*" element={
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="settings" element={<Settings />} />
                <Route path="add-item" element={<AddItem />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="orders" element={<Orders />} />
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
