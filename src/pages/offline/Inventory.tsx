import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import Inventory from '../../components/admin/Inventory';

export default function InventoryWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  return <Inventory />;
}
