import os

pages = [
    'Dashboard', 'Inventory', 'Settings', 'AddItem', 'AdminDashboard', 'Ledger', 'StaffRegister', 'ShoppingList'
]

offline_dir = r'd:\Website\Tracker\src\pages\offline'
online_admin_dir = r'd:\Website\Tracker\src\pages\online\admin'

os.makedirs(offline_dir, exist_ok=True)
os.makedirs(online_admin_dir, exist_ok=True)

wrapper_template = """import { useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import {PAGE} from '../../../components/admin/{PAGE}';

export default function {PAGE}Wrapper() {
  const setStoreType = useAppStore(s => s.setStoreType);
  
  useEffect(() => {
    setStoreType('{STORE_TYPE}');
  }, [setStoreType]);

  return <{PAGE} />;
}
"""

for page in pages:
    with open(os.path.join(offline_dir, f"{page}.tsx"), 'w') as f:
        f.write(wrapper_template.replace('{PAGE}', page).replace('{STORE_TYPE}', 'offline'))
        
    with open(os.path.join(online_admin_dir, f"{page}.tsx"), 'w') as f:
        f.write(wrapper_template.replace('{PAGE}', page).replace('{STORE_TYPE}', 'online'))

print("Wrappers created.")
