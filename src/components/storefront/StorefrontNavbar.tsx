import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  PhoneCall,
  Home
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import type { Category, Product, StoreSettings } from '../../types/ecommerce';
import { productService } from '../../services/productService';

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
  categories,
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
  const [isScrolled, setIsScrolled] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, searchQuery);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`sticky top-0 z-40 bg-[#F9F4EE]/95 backdrop-blur-md transition-all duration-200 border-b ${
      isScrolled ? 'border-[#E8D8CC] shadow-sm' : 'border-[#E8D8CC]/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          
          {/* Brand Logo in Artisan Script / Serif style (like 'Frem' in reference image) */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span 
              id="storefront-navbar-logo"
              className={`font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#4A2818] italic group-hover:opacity-80 transition-opacity inline-block ${
                isIntroActive ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {settings.storeName || 'Bake & Joy'}
            </span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#4A2818]">
            <Link
              to="/"
              className="hover:text-[#673D26] transition-colors py-1"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="hover:text-[#673D26] transition-colors py-1"
            >
              Products
            </Link>
            <Link
              to="/products?category=cat-cake-decoration"
              className="hover:text-[#673D26] transition-colors py-1"
            >
              Decorations
            </Link>
            <Link
              to="/products?category=cat-baking-ingredients"
              className="hover:text-[#673D26] transition-colors py-1"
            >
              Ingredients
            </Link>
            <Link
              to="/products?category=cat-packaging-boxes"
              className="hover:text-[#673D26] transition-colors py-1"
            >
              Packaging
            </Link>
          </nav>

          {/* Right Action Icons & Pill Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* Live Search Input */}
            <div ref={searchContainerRef} className="relative hidden sm:block w-44 lg:w-56">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => {
                    setLocalQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search supplies..."
                  className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-[#4A2818] placeholder:text-[#7A6153]/60 outline-none focus:border-[#4A2818] transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-[#7A6153] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </form>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E8D8CC] overflow-hidden z-50">
                  <div className="p-2 border-b border-[#E8D8CC]/40 text-[10px] font-bold text-[#7A6153] uppercase tracking-wider px-3">
                    Baking Supplies
                  </div>
                  <div className="divide-y divide-[#E8D8CC]/40">
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

            {/* Cart Button Pill in warm Cocoa */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] px-4 py-2.5 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center bg-[#EAD9CF] text-[#4A2818] text-[10px] font-bold w-4 h-4 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Desk Pill */}
            <Link
              to="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#DCC7B8] bg-[#F2E7DC] hover:bg-[#4A2818] text-[#4A2818] hover:text-[#F9F4EE] text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#4A2818] hover:bg-[#F2E7DC] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8D8CC] space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search baking supplies..."
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-full pl-9 pr-4 py-2 text-xs text-[#4A2818]"
              />
              <Search className="w-4 h-4 text-[#7A6153] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            <nav className="flex flex-col gap-1 text-sm font-medium text-[#4A2818]">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F2E7DC]"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F2E7DC]"
              >
                All Products
              </Link>
              <Link
                to="/products?category=cat-cake-decoration"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F2E7DC]"
              >
                Decorations
              </Link>
              <Link
                to="/products?category=cat-baking-ingredients"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#F2E7DC]"
              >
                Ingredients
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-[#4A2818] bg-[#F2E7DC] font-bold flex items-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};
