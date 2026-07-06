import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import Settings from '../../../components/admin/Settings';

export default function SettingsWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  return <Settings />;
}
