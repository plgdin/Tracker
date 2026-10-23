import { useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles, Package, ShieldCheck } from 'lucide-react';
import { NavBar, NavItem } from '../ui/tubelight-navbar';

export function MobileBottomNav() {
  const location = useLocation();

  // Hide on admin portal screens
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const items: NavItem[] = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Products', url: '/products', icon: ShoppingBag },
    { name: 'Decors', url: '/products?category=cat-cake-decoration', icon: Sparkles },
    { name: 'Ingredients', url: '/products?category=cat-baking-ingredients', icon: Package },
    { name: 'Counter', url: '/admin/login', icon: ShieldCheck },
  ];

  let activeItem = 'Home';
  if (location.pathname === '/products') {
    if (location.search.includes('cat-cake-decoration')) {
      activeItem = 'Decors';
    } else if (location.search.includes('cat-baking-ingredients')) {
      activeItem = 'Ingredients';
    } else {
      activeItem = 'Products';
    }
  } else if (location.pathname === '/') {
    activeItem = 'Home';
  }

  return (
    <div className="md:hidden">
      <NavBar 
        items={items} 
        activeItem={activeItem} 
        className="bottom-2 mb-2 z-40" 
      />
    </div>
  );
}

export default MobileBottomNav;
