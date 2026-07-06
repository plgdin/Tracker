import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import Ledger from '../../../components/admin/Ledger';

export default function LedgerWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  return <Ledger />;
}
