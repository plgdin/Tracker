import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  X,
  Sparkles,
  TrendingUp
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
  const [isFocused, setIsFocused] = useState(false);
  
  // Smooth hysteresis-based scroll detector (triggers at 25px, releases below 10px)
  const scrolled = useScroll(25);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: '/' or 'Cmd+K' / 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && document.activeElement !== inputRef.current) {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          inputRef.current?.focus();
          setShowSuggestions(true);
        }
      } else if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setShowSuggestions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

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
      className="sticky top-0 z-50 w-full h-20 pointer-events-none"
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
                scrolled && !isMobileMenuOpen ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
              )}
            >
              {settings.storeName || 'NayaKart'}
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
            
            {/* Live Search Input with Glassmorphism & Expanding Focus */}
            <div ref={searchContainerRef} className="relative hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div
                  className={cn(
                    'relative flex items-center h-9 sm:h-10 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    isFocused
                      ? 'bg-[#FCFAF7] border border-white/90 shadow-xl shadow-black/25 w-52 sm:w-64 md:w-72 lg:w-80 ring-2 ring-white/30'
                      : 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 w-36 sm:w-44 md:w-52 lg:w-60 shadow-inner shadow-black/10'
                  )}
                >
                  <Search
                    className={cn(
                      'w-4 h-4 ml-3.5 shrink-0 pointer-events-none transition-colors duration-200',
                      isFocused ? 'text-[#4A2818]' : 'text-[#EAD9CF]'
                    )}
                  />

                  <input
                    ref={inputRef}
                    type="text"
                    value={localQuery}
                    onChange={(e) => {
                      setLocalQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      setIsFocused(true);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                    }}
                    placeholder="Search supplies..."
                    className={cn(
                      'w-full h-full bg-transparent pl-2.5 pr-8 text-xs sm:text-sm font-normal outline-none transition-colors duration-200',
                      isFocused
                        ? 'text-[#361B0E] placeholder:text-[#8C7162]'
                        : 'text-[#F9F4EE] placeholder:text-[#EAD9CF]/70'
                    )}
                  />

                  {/* Clear Button (when text entered) OR subtle Shortcut Hint */}
                  {localQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalQuery('');
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        'mr-2.5 p-1 rounded-full hover:bg-black/10 transition-colors',
                        isFocused ? 'text-[#7A6153] hover:text-[#4A2818]' : 'text-[#EAD9CF] hover:text-white'
                      )}
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span
                      className={cn(
                        'mr-2.5 hidden lg:inline-flex items-center text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border pointer-events-none transition-colors duration-200',
                        isFocused
                          ? 'border-[#E8D8CC] text-[#7A6153] bg-[#F2E7DC]/60'
                          : 'border-white/20 text-[#EAD9CF]/70 bg-white/5'
                      )}
                    >
                      ⌘K
                    </span>
                  )}
                </div>
              </form>

              {/* Autocomplete Dropdown Popover */}
              {showSuggestions && (
                <div 
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before clicking items
                  className="absolute top-full right-0 mt-2.5 w-80 sm:w-96 bg-[#FCFAF7] rounded-2xl shadow-2xl border border-[#E8D8CC] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {/* Case 1: Active query with suggestions */}
                  {suggestions.length > 0 && (
                    <>
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F4ECE4]/70 border-b border-[#E8D8CC]">
                        <span className="text-[11px] font-semibold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#C87D55]" />
                          Matching Supplies ({suggestions.length})
                        </span>
                        <span className="text-[10px] text-[#7A6153]">Press Enter to view all</span>
                      </div>
                      
                      <div className="divide-y divide-[#E8D8CC]/50 max-h-80 overflow-y-auto">
                        {suggestions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectSuggestion(p)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#F2E7DC]/60 transition-colors group"
                          >
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-xl border border-[#E8D8CC] shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-serif font-bold text-[#4A2818] truncate group-hover:text-[#200E05]">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-[#7A6153] flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-1 h-1 rounded-full bg-[#C87D55]" />
                                <span>{p.categoryName}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <span className="text-xs font-bold text-[#4A2818] bg-[#F2E7DC] px-2 py-1 rounded-lg">
                                ₹{p.discountPrice || p.price}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5 bg-[#F9F4EE] border-t border-[#E8D8CC]">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full py-2 px-3 rounded-xl bg-[#4A2818] hover:bg-[#361B0E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                        >
                          <span>View all results for "{localQuery}"</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Case 2: Query entered but no results */}
                  {localQuery.trim().length >= 2 && suggestions.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#F2E7DC] flex items-center justify-center mx-auto mb-2.5 text-[#7A6153]">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-serif font-bold text-[#4A2818] mb-1">
                        No supplies found for "{localQuery}"
                      </p>
                      <p className="text-[11px] text-[#7A6153] mb-3">
                        Try searching for chocolate, moulds, boxes, or sprinkles.
                      </p>
                      <button
                        onClick={() => navigate('/products')}
                        className="text-xs font-semibold text-[#4A2818] bg-[#F2E7DC] hover:bg-[#EAD9CF] px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        Browse all catalog
                      </button>
                    </div>
                  )}

                  {/* Case 3: Empty query - Show Quick Trending Searches */}
                  {localQuery.trim().length < 2 && (
                    <div className="p-3.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A3825] uppercase tracking-wider mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#C87D55]" />
                        Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Belgian Couverture',
                          'Silicone Moulds',
                          'Cake Boxes',
                          'Vanilla Extract',
                          'Fondant',
                          'Baking Powder',
                        ].map((term) => (
                          <button
                            key={term}
                            onClick={() => {
                              setLocalQuery(term);
                              if (onSearchChange) onSearchChange(term);
                              setShowSuggestions(false);
                              navigate(`/products?q=${encodeURIComponent(term)}`);
                            }}
                            className="text-xs font-medium text-[#4A2818] bg-[#F2E7DC]/80 hover:bg-[#F2E7DC] hover:text-[#200E05] px-2.5 py-1.5 rounded-lg border border-[#E8D8CC] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
              style={{ color: '#FFFFFF' }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#6B371B] bg-[#4A2818] hover:bg-[#5C2E17] !text-white text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 !text-white text-white stroke-[2.2]" />
              <span className="!text-white text-white font-semibold">Admin</span>
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
              <div className="relative flex items-center h-11 rounded-full bg-white/10 border border-white/20 focus-within:bg-[#FCFAF7] focus-within:border-white transition-all shadow-inner shadow-black/10">
                <Search className="w-4 h-4 ml-3.5 text-[#EAD9CF] pointer-events-none shrink-0" />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="Search baking supplies..."
                  className="w-full h-full bg-transparent pl-2.5 pr-8 text-sm text-[#F9F4EE] placeholder:text-[#EAD9CF]/70 focus:text-[#361B0E] focus:placeholder:text-[#8C7162] outline-none"
                />
                {localQuery && (
                  <button
                    type="button"
                    onClick={() => setLocalQuery('')}
                    className="mr-3 p-1 rounded-full text-[#EAD9CF] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
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
              style={{ color: '#FFFFFF' }}
              className="w-full flex items-center justify-center gap-2 border border-[#6B371B] bg-[#4A2818] !text-white text-white py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 !text-white text-white" />
              <span className="!text-white text-white font-semibold">Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
