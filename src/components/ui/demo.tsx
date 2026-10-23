import { Home, User, Briefcase, FileText, ShoppingBag, Sparkles, Package, ShieldCheck } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText }
  ]

  return <NavBar items={navItems} />
}

export function StoreNavBarDemo() {
  const storeItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Products', url: '/products', icon: ShoppingBag },
    { name: 'Decorations', url: '/products?category=cat-cake-decoration', icon: Sparkles },
    { name: 'Ingredients', url: '/products?category=cat-baking-ingredients', icon: Package },
    { name: 'Admin', url: '/admin', icon: ShieldCheck },
  ]

  return <NavBar items={storeItems} />
}

export default NavBarDemo
