import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import Dashboard from '../../../components/admin/Dashboard';

export default function DashboardWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  return <Dashboard />;
}
