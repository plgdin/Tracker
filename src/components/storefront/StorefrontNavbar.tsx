import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import type { Category, Product, StoreSettings } from '../../types/ecommerce';
import { productService } from '../../services/productService';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';

interface StorefrontNavbarProps {
  settings: StoreSettings;
  categories: Category[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSelectProduct?: (product: Product) => void;
  isIntroActive?: boolean;
}

export const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({
  settings,
  searchQuery = '',
  onSearchChange,
  onSelectProduct,
  isIntroActive = false,
}) => {
  const { totalItems, setIsCartOpen } = useCartContext();
  const navigate = useNavigate();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Smooth hysteresis-based scroll detector (triggers at 25px, releases below 10px)
  const scrolled = useScroll(25);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!localQuery.trim() || localQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await productService.search({ query: localQuery });
      setSuggestions(results.slice(0, 5));
    }, 200);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearchChange) {
      onSearchChange(localQuery);
    }
    navigate(`/products?q=${encodeURIComponent(localQuery)}`);
  };

  const handleSelectSuggestion = (product: Product) => {
    setShowSuggestions(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/products?q=${encodeURIComponent(product.name)}`);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full h-20 pointer-events-none transition-opacity duration-700',
        isIntroActive ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
      )}
    >
      {/* Floating Animated Pill Card */}
      <div
        className={cn(
          'pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width,max-width,transform,border-radius,height,margin]',
          scrolled && !isMobileMenuOpen
            ? 'w-[94%] max-w-5xl mx-auto mt-3 h-14 rounded-full border border-[#5C2E17] bg-[#361B0E]/95 supports-[backdrop-filter]:bg-[#361B0E]/90 backdrop-blur-md shadow-2xl shadow-black/35 px-4 sm:px-6'
            : 'w-full max-w-full mx-auto mt-0 h-20 rounded-none border-b border-[#522914] bg-[#361B0E] shadow-sm px-4 sm:px-6 lg:px-8'
        )}
      >
        <div className="w-full h-full flex items-center justify-between">
          
          {/* Brand Logo in Warm Cream on Dark Chocolate */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span 
              id="storefront-navbar-logo"
              className={cn(
                'font-serif font-normal tracking-tight text-[#F9F4EE] italic group-hover:text-[#EAD9CF] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] inline-block',
                scrolled && !isMobileMenuOpen ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl',
                isIntroActive ? 'opacity-0' : 'opacity-100'
              )}
            >
              {settings.storeName || 'Bake & Joy'}
            </span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-[#F9F4EE]/90">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-full hover:bg-[#4A2818] hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-3 py-1.5 rounded-full hover:bg-[#4A2818] hover:text-white transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              to="/products?category=cat-cake-decoration"
              className="px-3 py-1.5 rounded-full hover:bg-[#4A2818] hover:text-white transition-colors duration-200"
            >
              Decorations
            </Link>
            <Link
              to="/products?category=cat-baking-ingredients"
              className="px-3 py-1.5 rounded-full hover:bg-[#4A2818] hover:text-white transition-colors duration-200"
            >
              Ingredients
            </Link>
            <Link
              to="/products?category=cat-packaging-boxes"
              className="px-3 py-1.5 rounded-full hover:bg-[#4A2818] hover:text-white transition-colors duration-200"
            >
              Packaging
            </Link>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Live Search Input with Smooth Width Transition */}
            <div ref={searchContainerRef} className="relative hidden sm:block">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => {
                    setLocalQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search..."
                  className={cn(
                    'bg-[#241108]/80 border border-[#542B16] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#F9F4EE] placeholder:text-[#C5B3A6] outline-none focus:border-[#EAD9CF] focus:bg-[#200E06] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    scrolled && !isMobileMenuOpen ? 'w-28 sm:w-36 md:w-40' : 'w-32 sm:w-40 md:w-48'
                  )}
                />
                <Search className="w-3.5 h-3.5 text-[#C5B3A6] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E8D8CC] overflow-hidden z-50">
                  <div className="p-2 border-b border-[#E8D8CC]/40 text-[10px] font-bold text-[#7A6153] uppercase tracking-wider px-3">
                    Baking Supplies
                  </div>
                  <div className="divide-y divide-[#E8D8CC]/40 max-h-72 overflow-y-auto">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectSuggestion(p)}
                        className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-[#F9F4EE] transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-8 h-8 object-cover rounded-lg border border-[#E8D8CC]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-serif font-bold text-[#4A2818] truncate">{p.name}</div>
                          <div className="text-[10px] text-[#7A6153]">{p.categoryName}</div>
                        </div>
                        <div className="text-xs font-serif font-bold text-[#4A2818]">₹{p.discountPrice || p.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button Pill in Warm Biscuit Contrast */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-[#F2E7DC] hover:bg-white text-[#4A2818] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center bg-[#4A2818] text-[#F9F4EE] text-[10px] font-bold w-4 h-4 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Desk Pill */}
            <Link
              to="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#5C2E17] bg-[#4A2818] hover:bg-[#5C2E17] text-[#F9F4EE] text-xs font-medium transition-colors duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#F9F4EE] hover:bg-[#4A2818] border border-[#542B16] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <MenuToggleIcon open={isMobileMenuOpen} className="size-4" duration={300} />
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu in Rich Cocoa */}
      <div
        className={cn(
          'pointer-events-auto fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-[#542B16] bg-[#361B0E]/98 backdrop-blur-md md:hidden transition-all duration-300',
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <div
          data-slot={isMobileMenuOpen ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out duration-200',
            'flex h-full w-full flex-col justify-between gap-y-4 p-5'
          )}
        >
          <div className="space-y-4">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search baking supplies..."
                className="w-full bg-[#241108] border border-[#542B16] rounded-full pl-9 pr-4 py-2 text-xs text-[#F9F4EE] placeholder:text-[#C5B3A6] outline-none"
              />
              <Search className="w-4 h-4 text-[#C5B3A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <div className="grid gap-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#F9F4EE] hover:bg-[#4A2818] transition-colors flex items-center justify-between"
              >
                <span>Home</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#F9F4EE] hover:bg-[#4A2818] transition-colors flex items-center justify-between"
              >
                <span>All Products</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
              <Link
                to="/products?category=cat-cake-decoration"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#F9F4EE] hover:bg-[#4A2818] transition-colors flex items-center justify-between"
              >
                <span>Cake Decorations</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
              <Link
                to="/products?category=cat-baking-ingredients"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#F9F4EE] hover:bg-[#4A2818] transition-colors flex items-center justify-between"
              >
                <span>Baking Ingredients</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
              <Link
                to="/products?category=cat-packaging-boxes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#F9F4EE] hover:bg-[#4A2818] transition-colors flex items-center justify-between"
              >
                <span>Boxes & Packaging</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-[#542B16]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#F2E7DC] text-[#4A2818] py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Cart ({totalItems})</span>
            </button>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 border border-[#5C2E17] bg-[#4A2818] text-[#F9F4EE] py-2.5 rounded-xl font-medium text-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
