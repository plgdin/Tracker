import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminDashboardWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  return <AdminDashboard />;
}
