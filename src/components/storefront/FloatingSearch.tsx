import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  TrendingUp, 
  ArrowRight,
  PackageOpen,
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Settings,
  Store,
  PlusCircle,
  ShoppingCart
} from 'lucide-react';
import { productService } from '../../services/productService';
import { useCartContext } from '../../context/CartContext';
import { usePlatformModifier } from '../../hooks/usePlatformModifier';
import type { Product } from '../../types/ecommerce';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Kbd } from '../ui/kbd';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Products';
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

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
  const { isCartOpen, setIsCartOpen } = useCartContext();
  const { modKey } = usePlatformModifier();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [_isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = location.pathname.startsWith('/admin');

  // Static Navigation and Quick Actions
  const baseCommands: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'nav-home',
        title: 'Customer Storefront',
        subtitle: 'Browse home & featured patisserie supplies',
        category: 'Navigation',
        icon: <Store className="w-4 h-4 text-[#4A2818]" />,
        shortcut: `${modKey}H`,
        onSelect: () => navigate('/'),
      },
      {
        id: 'nav-products',
        title: 'All Products Catalog',
        subtitle: 'Filter chocolate, colours, packaging & tools',
        category: 'Navigation',
        icon: <ShoppingBag className="w-4 h-4 text-[#4A2818]" />,
        shortcut: `${modKey}P`,
        onSelect: () => navigate('/products'),
      },
      {
        id: 'action-cart',
        title: isCartOpen ? 'Close Shopping Cart' : 'Open Shopping Cart',
        subtitle: 'View added bakery items and counter checkout',
        category: 'Actions',
        icon: <ShoppingCart className="w-4 h-4 text-[#4A2818]" />,
        shortcut: 'C',
        onSelect: () => setIsCartOpen(!isCartOpen),
      },
      {
        id: 'nav-admin-dashboard',
        title: 'Admin Dashboard',
        subtitle: 'Real-time sales, order volume & analytics',
        category: 'Navigation',
        icon: <LayoutDashboard className="w-4 h-4 text-[#4A2818]" />,
        shortcut: `${modKey}D`,
        onSelect: () => navigate('/admin'),
      },
      {
        id: 'nav-admin-products',
        title: 'Manage Inventory & Stock',
        subtitle: 'Add, edit and monitor 60+ baking products',
        category: 'Navigation',
        icon: <PlusCircle className="w-4 h-4 text-[#4A2818]" />,
        onSelect: () => navigate('/admin/products'),
      },
      {
        id: 'nav-admin-categories',
        title: 'Baking Categories',
        subtitle: 'Organize raw ingredients, tools and packaging',
        category: 'Navigation',
        icon: <Layers className="w-4 h-4 text-[#4A2818]" />,
        onSelect: () => navigate('/admin/categories'),
      },
      {
        id: 'nav-admin-orders',
        title: 'Orders & Pickup Desk',
        subtitle: 'Fulfill customer orders & manage WhatsApp notifications',
        category: 'Navigation',
        icon: <ClipboardList className="w-4 h-4 text-[#4A2818]" />,
        shortcut: `${modKey}O`,
        onSelect: () => navigate('/admin/orders'),
      },
      {
        id: 'nav-admin-settings',
        title: 'Store Settings',
        subtitle: 'Counter phone, hours, and store announcements',
        category: 'Navigation',
        icon: <Settings className="w-4 h-4 text-[#4A2818]" />,
        onSelect: () => navigate('/admin/settings'),
      },
    ];
  }, [navigate, isCartOpen, setIsCartOpen, modKey]);

  // Combined item list (matching navigation/actions + search results)
  const filteredCommands: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: CommandItem[] = [];

    if (!q) {
      return baseCommands;
    }

    // Filter base commands
    const matchingBase = baseCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q))
    );
    items.push(...matchingBase);

    // Append product results
    productResults.forEach((p) => {
      items.push({
        id: `prod-${p.id}`,
        title: p.name,
        subtitle: `${p.categoryName} • ₹${p.discountPrice || p.price}`,
        category: 'Products',
        icon: (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-5 h-5 rounded-md object-cover border border-[#E8D8CC]"
          />
        ),
        shortcut: '↵',
        onSelect: () => {
          setIsOpen(false);
          navigate(`/products?q=${encodeURIComponent(p.name)}`);
        },
      });
    });

    return items;
  }, [query, baseCommands, productResults, navigate]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length, query]);

  // Global hotkey: Cmd+K / Ctrl+K and action shortcuts (do NOT fire while typing in an input/textarea)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Cmd+K or Ctrl+K opens/closes command menu from ANYWHERE
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // If user is currently typing in an input, do not intercept other single-key shortcuts
      if (isTyping && activeEl !== inputRef.current) {
        return;
      }

      // Direct shortcuts while modal is open
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) =>
            filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0
          );
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) =>
            filteredCommands.length > 0
              ? (prev - 1 + filteredCommands.length) % filteredCommands.length
              : 0
          );
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].onSelect();
            setIsOpen(false);
          } else if (query.trim()) {
            setIsOpen(false);
            navigate(`/products?q=${encodeURIComponent(query.trim())}`);
          }
          return;
        }
      }

      // Hotkey '/' to open search when not typing
      if (!isOpen && !isTyping && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, query, navigate]);

  // Autofocus input when command menu opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setProductResults([]);
    }
  }, [isOpen]);

  // Search debouncing for product results
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setProductResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await productService.search({ query });
      setProductResults(results.slice(0, 6));
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 animate-in fade-in motion-reduce:transition-none motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}

      {/* Linear-style Centered Command Menu Modal */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command Menu"
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-32px)] sm:w-[560px] md:w-[620px] max-h-[80vh] bg-[#FCFAF7] rounded-[2rem] shadow-2xl border border-[#E8D8CC] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 motion-reduce:transition-none motion-reduce:animate-none"
        >
          {/* Search Header Bar with Superhuman shortcut hints */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-[#E8D8CC] flex items-center gap-2.5">
            <Search className="w-5 h-5 text-[#4A2818] shrink-0" />
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, pages, ingredients, moulds (↑↓ to navigate)..."
                clearable
                onClear={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                size="lg"
                className="bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base text-[#361B0E] placeholder:text-[#8C7162] px-0 h-9"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Kbd>{modKey}</Kbd>
              <Kbd>K</Kbd>
              <span className="text-[#E8D8CC] mx-0.5">•</span>
              <Kbd className="cursor-pointer" onClick={() => setIsOpen(false)}>
                ESC
              </Kbd>
            </div>
          </div>

          {/* Quick Popular Searches if query is empty */}
          {!query.trim() && (
            <div className="px-4 py-2.5 bg-[#F9F4EE]/80 border-b border-[#E8D8CC]/60 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-[#7A6153] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#C87D55]" />
                Trending:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {POPULAR_SEARCH_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="text-[11px] font-medium text-[#4A2818] bg-white hover:bg-[#F2E7DC] px-2.5 py-0.5 rounded-full border border-[#E8D8CC] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Command Menu Body */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-[#E8D8CC]/30">
            {filteredCommands.length > 0 ? (
              <div className="space-y-1">
                {filteredCommands.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        item.onSelect();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-[#4A2818] text-[#F9F4EE]'
                          : 'text-[#4A2818] hover:bg-[#F2E7DC]/60'
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
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className={cn('text-xs sm:text-sm font-semibold truncate', isSelected ? 'text-white' : 'text-[#361B0E]')}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className={cn('text-[11px] truncate', isSelected ? 'text-[#F9F4EE]/70' : 'text-[#7A6153]')}>
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shortcut hint badge */}
                      {item.shortcut && (
                        <div className="shrink-0 flex items-center gap-1">
                          <Kbd
                            className={cn(
                              isSelected
                                ? 'bg-white/20 text-white border-white/30'
                                : 'bg-[#F2E7DC] text-[#4A2818] border-[#E8D8CC]'
                            )}
                          >
                            {item.shortcut}
                          </Kbd>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2E7DC] flex items-center justify-center mx-auto mb-3 text-[#7A6153]">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-serif font-bold text-[#4A2818] mb-1">
                  No commands or supplies match "{query}"
                </p>
                <p className="text-xs text-[#7A6153] mb-4">
                  Check spelling or try "Orders", "Products", or "Chocolate".
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar with Keyboard Helper Hints */}
          <div className="p-2.5 sm:p-3 bg-[#F9F4EE] border-t border-[#E8D8CC] flex items-center justify-between text-[11px] text-[#7A6153]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> Navigate
              </span>
              <span className="text-[#E8D8CC]">•</span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> Select
              </span>
            </div>
            {query.trim() && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/products?q=${encodeURIComponent(query.trim())}`);
                }}
                className="font-semibold text-[#4A2818] hover:underline flex items-center gap-1"
              >
                <span>View catalog search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on Storefront only */}
      {!isAdmin && (
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              'group relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 motion-reduce:transition-none',
              isOpen
                ? 'bg-[#361B0E] text-[#F9F4EE] border-2 border-[#EAD9CF] rotate-90 shadow-black/60'
                : 'bg-gradient-to-br from-[#4A2818] to-[#2E1408] text-[#F9F4EE] border-2 border-[#EAD9CF]/40 hover:border-[#EAD9CF] hover:scale-105 shadow-black/40 hover:shadow-black/60'
            )}
            aria-label={isOpen ? 'Close Command Menu' : 'Open Command Menu (Cmd+K)'}
            title={`Command Menu (${modKey}K)`}
          >
            {/* Ambient Pulse Ring when closed */}
            {!isOpen && (
              <span className="absolute -inset-1 rounded-full bg-[#FF5F14]/20 animate-ping pointer-events-none opacity-40 motion-reduce:animate-none" />
            )}

            {isOpen ? (
              <X className="w-6 h-6 stroke-[2.4]" />
            ) : (
              <Search className="w-6 h-6 stroke-[2.2] group-hover:rotate-12 transition-transform duration-300 motion-reduce:transition-none" />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingSearch;
