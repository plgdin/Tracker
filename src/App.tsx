import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import AddItem from './pages/AddItem';
import AdminDashboard from './pages/AdminDashboard';
import Toast from './components/Toast';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Toast />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="settings" element={<Settings />} />
            <Route path="add-item" element={<AddItem />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
