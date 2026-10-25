import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  PackageOpen
} from 'lucide-react';
import { productService } from '../../services/productService';
import type { Product } from '../../types/ecommerce';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

const POPULAR_SEARCH_CHIPS = [
  'Belgian Couverture',
  'Silicone Moulds',
  'Cake Boxes',
  'Vanilla Extract',
  'Fondant',
  'Baking Powder',
  'Sprinkles',
];

export const FloatingSearch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Global hotkey: '/' or 'Cmd+K' / 'Ctrl+K' to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && document.activeElement !== inputRef.current) {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Autofocus input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  // Search debouncing
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await productService.search({ query });
      setSuggestions(results.slice(0, 6));
      setIsSearching(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false);
    navigate(`/products?q=${encodeURIComponent(product.name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    navigate(`/products?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Floating Search Popover Card anchored above FAB */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-8 z-50 w-[calc(100vw-32px)] sm:w-[440px] md:w-[460px] max-h-[75vh] bg-[#FCFAF7] rounded-3xl shadow-2xl border border-[#E8D8CC] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        >
          {/* Search Header Bar */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-3.5 bg-white border-b border-[#E8D8CC] flex items-center gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search baking supplies, flavours, moulds..."
                leftIcon={<Search className="text-[#4A2818]" />}
                clearable
                onClear={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                size="lg"
                className="bg-[#FCFAF7] border-[#E8D8CC] focus-visible:ring-[#C87D55]/30 text-sm sm:text-base text-[#361B0E] placeholder:text-[#8C7162] rounded-2xl"
              />
            </div>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-2 rounded-xl border border-[#E8D8CC] text-[#7A6153] bg-[#F9F4EE] shrink-0">
              ESC
            </span>
          </form>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E8D8CC]/50">
            
            {/* Quick Trending Chips (Shown when query empty) */}
            {!query.trim() && (
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A3825] uppercase tracking-wider mb-3">
                  <TrendingUp className="w-4 h-4 text-[#C87D55]" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="text-xs font-medium text-[#4A2818] bg-[#F2E7DC]/80 hover:bg-[#EAD9CF] hover:text-[#200E05] px-3 py-1.5 rounded-full border border-[#E8D8CC] transition-all hover:scale-105 active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Matching Results */}
            {suggestions.length > 0 && (
              <div className="p-2 sm:p-3 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#7A6153] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C87D55]" />
                    Found ({suggestions.length})
                  </span>
                  <span>Press Enter to view all</span>
                </div>

                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className="w-full flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#F2E7DC]/60 transition-colors text-left group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded-xl border border-[#E8D8CC] shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-serif font-bold text-[#4A2818] truncate group-hover:text-[#200E05]">
                        {p.name}
                      </div>
                      <div className="text-xs text-[#7A6153] flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C87D55]" />
                        <span>{p.categoryName}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-bold text-[#4A2818] bg-[#F2E7DC] px-2.5 py-1 rounded-lg">
                        ₹{p.discountPrice || p.price}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Fallback */}
            {query.trim().length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2E7DC] flex items-center justify-center mx-auto mb-3 text-[#7A6153]">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-serif font-bold text-[#4A2818] mb-1">
                  No supplies found for "{query}"
                </p>
                <p className="text-xs text-[#7A6153] mb-4">
                  Check the spelling or try searching for chocolate, moulds, or boxes.
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/products');
                  }}
                  className="text-xs font-semibold text-[#4A2818] bg-[#F2E7DC] hover:bg-[#EAD9CF] px-4 py-2 rounded-full transition-colors"
                >
                  Browse all products
                </button>
              </div>
            )}
          </div>

          {/* Footer View All CTA (When query present) */}
          {query.trim() && (
            <div className="p-3 bg-[#F9F4EE] border-t border-[#E8D8CC]">
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A2818] hover:bg-[#361B0E] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>View all results for "{query}"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Circle Button (FAB) at Bottom Right */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90',
            isOpen
              ? 'bg-[#361B0E] text-[#F9F4EE] border-2 border-[#EAD9CF] rotate-90 shadow-black/60'
              : 'bg-gradient-to-br from-[#4A2818] to-[#2E1408] text-[#F9F4EE] border-2 border-[#EAD9CF]/40 hover:border-[#EAD9CF] hover:scale-110 shadow-black/40 hover:shadow-black/60'
          )}
          aria-label={isOpen ? 'Close Search' : 'Open Search'}
          title="Search supplies (⌘K)"
        >
          {/* Subtle Ambient Pulse Ring when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-[#FF5F14]/20 animate-ping pointer-events-none opacity-40" />
          )}

          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.4]" />
          ) : (
            <Search className="w-6 h-6 stroke-[2.2] group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingSearch;
