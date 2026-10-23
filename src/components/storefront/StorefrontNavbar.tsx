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
  Cake,
  PhoneCall
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
}

export const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({
  settings,
  categories,
  searchQuery = '',
  onSearchChange,
  onSelectProduct,
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
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounced suggestion
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
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
      isScrolled ? 'border-[#351E28]/10 shadow-sm' : 'border-black/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-[#351E28] flex items-center justify-center text-[#EAF05C] group-hover:scale-105 transition-transform shadow-sm">
              <Cake className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-2xl font-black text-[#351E28] tracking-tight">
                  {settings.storeName || 'Bake & Joy'}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF5C34]" />
              </div>
              <p className="text-[11px] font-semibold tracking-wider text-[#351E28]/60 uppercase">
                Baking Pantry & Decor
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setShowSuggestions(true);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search nozzles, moulds, cocoa, whipping cream..."
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white text-[#351E28] placeholder-[#351E28]/40 rounded-full py-2.5 pl-11 pr-24 text-sm font-medium outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#FF5C34] hover:bg-[#e44c26] text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#351E28]/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-[#351E28]/5 text-[11px] font-bold text-[#351E28]/50 uppercase tracking-wider px-3">
                  Matching Baking Supplies
                </div>
                <div className="divide-y divide-[#351E28]/5">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectSuggestion(p)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#F8F7F0] transition-colors"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-[#351E28]/10"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#351E28] truncate">{p.name}</div>
                        <div className="text-[11px] text-[#351E28]/60">{p.categoryName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-[#FF5C34]">₹{p.discountPrice || p.price}</div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-[#351E28]/40 line-through">₹{p.price}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 bg-[#F8F7F0] text-center border-t border-[#351E28]/5">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#FF5C34] hover:text-[#e44c26] transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="px-3.5 py-2 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] rounded-full hover:bg-[#F8F7F0] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="px-3.5 py-2 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] rounded-full hover:bg-[#F8F7F0] transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/products?category=cat-cake-decoration"
                className="px-3.5 py-2 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] rounded-full hover:bg-[#F8F7F0] transition-colors"
              >
                Decorations
              </Link>
              <Link
                to="/products?category=cat-baking-ingredients"
                className="px-3.5 py-2 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] rounded-full hover:bg-[#F8F7F0] transition-colors"
              >
                Ingredients
              </Link>
            </nav>

            {/* Admin Shortcut Pill */}
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#351E28]/15 bg-[#F8F7F0] hover:bg-[#351E28] hover:text-[#EAF05C] text-xs font-bold text-[#351E28] transition-all"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C34]" />
              <span>Admin</span>
            </Link>

            {/* Cart Button with Orange Topaze Pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#FF5C34] hover:bg-[#e44c26] text-white px-4 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.3]" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center bg-[#EAF05C] text-[#351E28] text-xs font-black w-5 h-5 rounded-full shadow-inner">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#351E28] hover:bg-[#F8F7F0] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Search supplies, moulds, flavours..."
              className="w-full bg-[#F8F7F0] border border-[#351E28]/15 text-[#351E28] placeholder-[#351E28]/50 rounded-full py-2 pl-10 pr-20 text-xs font-medium outline-none focus:border-[#FF5C34]"
            />
            <Search className="w-3.5 h-3.5 text-[#351E28]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#351E28] text-[#EAF05C] text-[10px] font-bold px-3 py-1 rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#351E28]/10 bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top-3 duration-200">
          <div className="space-y-1 mb-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-[#351E28] hover:bg-[#F8F7F0] rounded-xl"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-[#351E28] hover:bg-[#F8F7F0] rounded-xl"
            >
              Browse All Products
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#FF5C34] hover:bg-[#F8F7F0] rounded-xl"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard (Demo Login)</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#351E28]/10">
            <div className="text-xs font-black text-[#351E28]/50 uppercase tracking-wider mb-2 px-3">
              Popular Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#351E28] bg-[#F8F7F0] hover:bg-[#D7EFFF] rounded-lg truncate"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#351E28]/10 flex items-center justify-between text-xs text-[#351E28]/70 px-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF5C34]" />
              Bangalore Store
            </span>
            <a
              href="tel:+919845012345"
              className="flex items-center gap-1 font-bold text-[#351E28] hover:text-[#FF5C34] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF5C34]" />
              +91 98450 12345
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
