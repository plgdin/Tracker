import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import Dashboard from '../../components/admin/Dashboard';

export default function DashboardWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  if (storeType !== 'offline') return null;

  return <Dashboard />;
}
