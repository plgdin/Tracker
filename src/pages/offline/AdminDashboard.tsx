import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminDashboardWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  if (storeType !== 'offline') return null;

  return <AdminDashboard />;
}
