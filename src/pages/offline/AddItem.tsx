import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import AddItem from '../../components/admin/AddItem';

export default function AddItemWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  return <AddItem />;
}
