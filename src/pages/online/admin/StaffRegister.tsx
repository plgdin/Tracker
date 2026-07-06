import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import StaffRegister from '../../../components/admin/StaffRegister';

export default function StaffRegisterWrapper() {
  const storeType = useAppStore((s: any) => s.storeType);
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  if (storeType !== 'online') return null;

  return <StaffRegister />;
}
