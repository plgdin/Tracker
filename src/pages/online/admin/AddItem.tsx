import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import AddItem from '../../../components/admin/AddItem';

export default function AddItemWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  if (storeType !== 'online') return null;

  return <AddItem />;
}
