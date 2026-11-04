import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  TrendingUp, 
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Cake,
  Box,
  PackageOpen,
  ChevronRight
} from 'lucide-react';
import { productService } from '../../services/productService';
import { useCartContext } from '../../context/CartContext';
import type { Product } from '../../types/ecommerce';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface QuickCategory {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  icon: React.ReactNode;
}

const QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: 'cat-ingredients',
    title: 'Baking Ingredients & Chocolates',
    subtitle: 'Couverture slabs, cocoa powder, whipping creams & fillings',
    path: '/products?category=cat-baking-ingredients',
    icon: <Cake className="w-4 h-4 text-[#C87D55]" />,
  },
  {
    id: 'cat-tools',
    title: 'Cake Moulds, Bakeware & Tools',
    subtitle: 'Silicone moulds, nozzles, revolving turntables & scrapers',
    path: '/products?category=cat-tools-equipment',
    icon: <Sparkles className="w-4 h-4 text-[#C87D55]" />,
  },
  {
    id: 'cat-packaging',
    title: 'Cake Boxes & Packaging',
    subtitle: 'Tall window boxes, heavy-duty gold boards & cupcake inserts',
    path: '/products?category=cat-packaging-supplies',
    icon: <Box className="w-4 h-4 text-[#C87D55]" />,
  },
  {
    id: 'cat-decorations',
    title: 'Cake Decorations & Food Colours',
    subtitle: 'Gel colours, luster dust, sprinkles & acrylic cake toppers',
    path: '/products?category=cat-cake-decoration',
    icon: <Sparkles className="w-4 h-4 text-[#C87D55]" />,
  },
  {
    id: 'cat-all',
    title: 'Explore All Supplies & Bakeware',
    subtitle: 'View our full inventory of 300+ bakery items and deals',
    path: '/products',
    icon: <ShoppingBag className="w-4 h-4 text-[#C87D55]" />,
  },
];

const POPULAR_SEARCH_CHIPS = [
  'Belgian Couverture',
  'Silicone Moulds',
  'Cake Boxes',
  'Vanilla Extract',
  'Fondant',
  'Piping Nozzles',
  'Sprinkles',
];

export const FloatingSearch: React.FC = () => {
  const navigate = useNavigate();
  const { isCartOpen, setIsCartOpen } = useCartContext();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Search debouncing for product results
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setProductResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await productService.search({ query });
        setProductResults(results.slice(0, 8));
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleOpenCustom = () => setIsOpen(true);
    window.addEventListener('open-storefront-search', handleOpenCustom);
    return () => window.removeEventListener('open-storefront-search', handleOpenCustom);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Cmd+K or Ctrl+K opens/closes search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Hotkey '/' to open search when not typing
      if (!isOpen && !isTyping && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Shortcuts while modal is open
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
          return;
        }

        const maxItems = query.trim() ? productResults.length : QUICK_CATEGORIES.length + 1;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (maxItems > 0 ? (prev + 1) % maxItems : 0));
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (maxItems > 0 ? (prev - 1 + maxItems) % maxItems : 0));
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (query.trim()) {
            if (productResults[selectedIndex]) {
              setIsOpen(false);
              navigate(`/products?q=${encodeURIComponent(productResults[selectedIndex].name)}`);
            } else {
              setIsOpen(false);
              navigate(`/products?q=${encodeURIComponent(query.trim())}`);
            }
          } else {
            if (selectedIndex < QUICK_CATEGORIES.length) {
              setIsOpen(false);
              navigate(QUICK_CATEGORIES[selectedIndex].path);
            } else {
              setIsOpen(false);
              setIsCartOpen(true);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, productResults, selectedIndex, navigate, setIsCartOpen]);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setProductResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleChipClick = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    navigate(`/products?q=${encodeURIComponent(term)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 animate-in fade-in motion-reduce:transition-none motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}

      {/* Centered User-Friendly Customer Search Modal */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search Store"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-32px)] sm:w-[560px] md:w-[620px] max-h-[82dvh] bg-[#FCFAF7] rounded-[2rem] shadow-2xl border border-[#E8D8CC] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 motion-reduce:transition-none motion-reduce:animate-none"
        >
          {/* Friendly Search Header Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="p-3.5 sm:p-4 bg-white border-b border-[#E8D8CC] flex items-center gap-3"
          >
            <Search className="w-5 h-5 text-[#4A2818] shrink-0" />
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search ingredients, moulds, cake boxes, chocolates..."
                clearable
                onClear={() => {
                  setQuery('');
                  setProductResults([]);
                  inputRef.current?.focus();
                }}
                size="lg"
                className="bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-[#361B0E] placeholder:text-[#8C7162] px-0 h-9"
              />
            </div>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6153] hover:text-[#361B0E] hover:bg-[#F2E7DC] transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

          {/* Trending Searches Row */}
          <div className="px-4 py-2.5 bg-[#F9F4EE]/90 border-b border-[#E8D8CC]/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-[#7A6153] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#C87D55]" />
              Trending:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {POPULAR_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="text-xs font-medium text-[#4A2818] bg-white hover:bg-[#F2E7DC] px-2.5 py-1 rounded-full border border-[#E8D8CC] transition-colors shadow-2xs hover:scale-102"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-[#E8D8CC]/40">
            {query.trim().length >= 2 ? (
              /* Product Search Results */
              isSearching ? (
                <div className="py-12 text-center text-xs text-[#7A6153]">
                  Searching baking supplies...
                </div>
              ) : productResults.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A6153] px-2 pb-1">
                    Matching Products ({productResults.length})
                  </div>
                  {productResults.map((product, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={product.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/products?q=${encodeURIComponent(product.name)}`);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-[#4A2818] text-[#F9F4EE]'
                            : 'hover:bg-[#F2E7DC]/60 text-[#361B0E]'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.images[0] || '/cat-baking-materials.jpg'}
                            alt={product.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/cat-baking-materials.jpg';
                            }}
                            className="w-10 h-10 rounded-lg object-cover border border-[#E8D8CC] bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <div className={cn('text-xs sm:text-sm font-semibold truncate', isSelected ? 'text-white' : 'text-[#361B0E]')}>
                              {product.name}
                            </div>
                            <div className={cn('text-[11px] truncate flex items-center gap-1.5', isSelected ? 'text-[#F9F4EE]/80' : 'text-[#7A6153]')}>
                              <span>{product.categoryName}</span>
                              <span>•</span>
                              <span className={cn('font-semibold', isSelected ? 'text-amber-200' : 'text-[#4A2818]')}>
                                ₹{product.discountPrice || product.price}
                              </span>
                              {product.discountPrice && (
                                <span className={cn('line-through text-[10px]', isSelected ? 'text-white/50' : 'text-[#7A6153]/60')}>
                                  ₹{product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', isSelected ? 'text-white translate-x-0.5' : 'text-[#7A6153]')} />
                      </div>
                    );
                  })}

                  {/* View All Search Results Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products?q=${encodeURIComponent(query.trim())}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#4A2818] bg-[#F2E7DC] hover:bg-[#E8D8CC] transition-colors"
                    >
                      <span>See all products matching "{query}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* No Results Found */
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F2E7DC] flex items-center justify-center mx-auto text-[#7A6153]">
                    <PackageOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-serif font-bold text-[#4A2818] mb-1">
                      No supplies match "{query}"
                    </p>
                    <p className="text-xs text-[#7A6153]">
                      Try searching for "Chocolate", "Turntable", "Boxes", or "Vanilla"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/products');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A2818] bg-white border border-[#E8D8CC] hover:bg-[#F2E7DC] px-4 py-2 rounded-full transition-colors"
                  >
                    <span>Browse All Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            ) : (
              /* Default State: Popular Categories & Quick Shopping */
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A6153] px-2">
                  Popular Categories
                </div>

                <div className="space-y-1.5">
                  {QUICK_CATEGORIES.map((cat, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={cat.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(cat.path);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-[#4A2818] text-[#F9F4EE]'
                            : 'hover:bg-[#F2E7DC]/60 text-[#361B0E]'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                              isSelected
                                ? 'bg-white/10 border-white/20 text-[#F9F4EE]'
                                : 'bg-white border-[#E8D8CC] text-[#4A2818]'
                            )}
                          >
                            {cat.icon}
                          </div>
                          <div className="min-w-0">
                            <div className={cn('text-xs sm:text-sm font-semibold truncate', isSelected ? 'text-white' : 'text-[#361B0E]')}>
                              {cat.title}
                            </div>
                            <div className={cn('text-[11px] truncate', isSelected ? 'text-[#F9F4EE]/80' : 'text-[#7A6153]')}>
                              {cat.subtitle}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', isSelected ? 'text-white translate-x-0.5' : 'text-[#7A6153]')} />
                      </div>
                    );
                  })}

                  {/* Quick Cart Option */}
                  <div
                    role="option"
                    aria-selected={selectedIndex === QUICK_CATEGORIES.length}
                    onClick={() => {
                      setIsOpen(false);
                      setIsCartOpen(!isCartOpen);
                    }}
                    onMouseEnter={() => setSelectedIndex(QUICK_CATEGORIES.length)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-colors',
                      selectedIndex === QUICK_CATEGORIES.length
                        ? 'bg-[#4A2818] text-[#F9F4EE]'
                        : 'hover:bg-[#F2E7DC]/60 text-[#361B0E]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                          selectedIndex === QUICK_CATEGORIES.length
                            ? 'bg-white/10 border-white/20 text-[#F9F4EE]'
                            : 'bg-white border-[#E8D8CC] text-[#4A2818]'
                        )}
                      >
                        <ShoppingCart className="w-4 h-4 text-[#C87D55]" />
                      </div>
                      <div className="min-w-0">
                        <div className={cn('text-xs sm:text-sm font-semibold truncate', selectedIndex === QUICK_CATEGORIES.length ? 'text-white' : 'text-[#361B0E]')}>
                          {isCartOpen ? 'Close Shopping Cart' : 'View Shopping Cart'}
                        </div>
                        <div className={cn('text-[11px] truncate', selectedIndex === QUICK_CATEGORIES.length ? 'text-[#F9F4EE]/80' : 'text-[#7A6153]')}>
                          Check items in your cart and proceed to checkout
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', selectedIndex === QUICK_CATEGORIES.length ? 'text-white translate-x-0.5' : 'text-[#7A6153]')} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simple, Clean Customer Footer Bar */}
          <div className="p-3 bg-[#F9F4EE] border-t border-[#E8D8CC] flex items-center justify-between text-xs text-[#7A6153]">
            <span className="hidden sm:inline">
              Type any supply name or select a category
            </span>
            <span className="sm:hidden">
              Press Enter to search
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-medium text-[#4A2818] hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Friendly, Accessible Floating Search Pill (Desktop & Tablet) */}
      <div className="hidden sm:block fixed bottom-8 right-8 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'group relative flex items-center gap-2 rounded-full shadow-2xl transition-all duration-300 active:scale-95 border cursor-pointer select-none',
            isOpen
              ? 'w-11 h-11 sm:w-12 sm:h-12 justify-center bg-[#361B0E] text-[#F9F4EE] border-[#EAD9CF] shadow-black/50 rotate-90'
              : 'h-11 sm:h-12 px-3.5 sm:px-4 bg-[#361B0E]/95 hover:bg-[#4A2818] text-[#F9F4EE] border-[#EADBCE]/50 shadow-black/35 backdrop-blur-md hover:shadow-2xl hover:scale-103'
          )}
          aria-label={isOpen ? 'Close Search' : 'Open Search'}
          title="Search baking supplies (/ or ⌘K)"
        >
          {isOpen ? (
            <X className="w-5 h-5 stroke-[2.2] -rotate-90" />
          ) : (
            <>
              <div className="w-7 h-7 rounded-full bg-[#4A2818] flex items-center justify-center text-[#EAD9CF] shrink-0 border border-[#6B371B]/70 shadow-xs group-hover:scale-110 transition-transform">
                <Search className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>
              <span className="text-xs font-semibold tracking-tight text-[#F9F4EE] pr-1">
                Search <span className="hidden sm:inline">supplies</span>
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingSearch;
