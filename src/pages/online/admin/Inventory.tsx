import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import Inventory from '../../../components/admin/Inventory';

export default function InventoryWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  if (storeType !== 'online') return null;

  return <Inventory />;
}
