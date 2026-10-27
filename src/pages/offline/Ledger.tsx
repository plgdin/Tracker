import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import Ledger from '../../components/admin/Ledger';

export default function LedgerWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  if (storeType !== 'offline') return null;

  return <Ledger />;
}
