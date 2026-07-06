import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import StaffRegister from '../../../components/admin/StaffRegister';

export default function StaffRegisterWrapper() {
  const setStoreType = useAppStore((s: any) => s.setStoreType);
  
  useEffect(() => {
    setStoreType('online');
  }, [setStoreType]);

  return <StaffRegister />;
}
