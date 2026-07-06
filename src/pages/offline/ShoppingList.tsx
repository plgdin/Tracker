import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import ShoppingList from '../../components/admin/ShoppingList';

export default function ShoppingListWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('offline');
  }, [setStoreType]);

  return <ShoppingList />;
}
