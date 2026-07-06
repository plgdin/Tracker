import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import ShoppingList from '../../components/admin/ShoppingList';

export default function ShoppingListWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  if (storeType !== 'offline') return null;

  return <ShoppingList />;
}
