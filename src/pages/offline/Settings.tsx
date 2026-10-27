import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import Settings from '../../components/admin/Settings';

export default function SettingsWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  if (storeType !== 'offline') return null;

  return <Settings />;
}
