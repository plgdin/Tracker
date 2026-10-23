import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  PackageOpen,
  ChevronRight
} from 'lucide-react';
import { AnnouncementBar } from '../components/storefront/AnnouncementBar';
import { StorefrontNavbar } from '../components/storefront/StorefrontNavbar';
import { ProductCard } from '../components/storefront/ProductCard';
import { ProductDetailModal } from '../components/storefront/ProductDetailModal';
import { CartDrawer } from '../components/storefront/CartDrawer';
import { CheckoutModal } from '../components/storefront/CheckoutModal';
import { OrderConfirmationModal } from '../components/storefront/OrderConfirmationModal';
import { StorefrontFooter } from '../components/storefront/StorefrontFooter';

import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { settingsService } from '../services/settingsService';
import type { Product, Category, StoreSettings, Order } from '../types/ecommerce';
import { INITIAL_SETTINGS } from '../services/mockData';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filters State
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedPricePreset, setSelectedPricePreset] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'popular' | 'newest'>('featured');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedWhatsappUrl, setConfirmedWhatsappUrl] = useState<string>('');

  // Load initial catalog
  useEffect(() => {
    const init = async () => {
      const [s, cats, prods] = await Promise.all([
        settingsService.getSettings(),
        categoryService.getAll(),
        productService.getActive(),
      ]);
      setSettings(s);
      setCategories(cats);
      setAllProducts(prods);
    };
    init();
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    const urlCat = searchParams.get('category') || 'all';
    const urlQ = searchParams.get('q') || '';
    setSelectedCategory(urlCat);
    setSearchQuery(urlQ);
  }, [searchParams]);

  // Apply filters & sorting
  useEffect(() => {
    let list = [...allProducts];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Stock availability
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Price preset
    if (selectedPricePreset !== 'all') {
      const [minStr, maxStr] = selectedPricePreset.split('-');
      const min = Number(minStr);
      const max = maxStr ? Number(maxStr) : Infinity;

      list = list.filter((p) => {
        const effPrice = p.discountPrice || p.price;
        return effPrice >= min && effPrice <= max;
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'popular':
        list.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    setFilteredProducts(list);
  }, [allProducts, selectedCategory, searchQuery, inStockOnly, selectedPricePreset, sortBy]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catId === 'all') next.delete('category');
      else next.set('category', catId);
      return next;
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!q.trim()) next.delete('q');
      else next.set('q', q.trim());
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setInStockOnly(false);
    setSelectedPricePreset('all');
    setSortBy('featured');
    setSearchParams({});
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (searchQuery.trim()) count++;
    if (inStockOnly) count++;
    if (selectedPricePreset !== 'all') count++;
    return count;
  }, [selectedCategory, searchQuery, inStockOnly, selectedPricePreset]);

  const activeCategoryObject = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8F7F0] text-[#351E28] flex flex-col font-body selection:bg-[#EAF05C] selection:text-[#351E28]">
      
      {/* Announcement Bar */}
      <AnnouncementBar settings={settings} />

      {/* Main Navbar */}
      <StorefrontNavbar
        settings={settings}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Page Header Banner */}
      <div className="bg-white border-b border-[#351E28]/10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#351E28]/60 font-medium mb-2">
            <Link to="/" className="hover:text-[#FF5C34]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#351E28] font-bold">
              {activeCategoryObject ? activeCategoryObject.name : 'All Products'}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#351E28] tracking-tight">
                {activeCategoryObject ? activeCategoryObject.name : 'Baking Supplies & Essentials'}
              </h1>
              <p className="text-xs sm:text-sm text-[#351E28]/70 mt-1">
                {activeCategoryObject ? activeCategoryObject.description : 'Explore professional cake decorating tools, couverture chocolates, flavours, and packaging.'}
              </p>
            </div>

            <div className="text-xs font-bold text-[#AEBBA0] shrink-0">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </div>
          </div>

        </div>
      </div>

      {/* Category Pills Slider (Fast horizontal navigation) */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#351E28]/10 sticky top-20 z-30 overflow-x-auto no-scrollbar py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#351E28] text-[#EAF05C] shadow-sm'
                : 'bg-[#F8F7F0] text-[#351E28] hover:bg-[#D7EFFF]'
            }`}
          >
            All Categories ({allProducts.length})
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            const count = allProducts.filter((p) => p.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#EAF05C] text-[#351E28] border-[#351E28] shadow-sm'
                    : 'bg-[#F8F7F0] text-[#351E28]/80 border-transparent hover:bg-[#D7EFFF]'
                }`}
              >
                <span>{c.name}</span>
                <span className="ml-1 text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-5 border-2 border-[#351E28]/10 space-y-6 sticky top-36">
              
              {/* Header with Clear button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#351E28]/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF5C34]" />
                  <span className="font-heading font-black text-sm text-[#351E28]">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#EAF05C] text-[#351E28] text-[11px] font-black flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#FF5C34] hover:text-[#e44c26] transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-[#351E28]">In-Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF5C34] accent-[#FF5C34] cursor-pointer"
                  />
                </label>
              </div>

              {/* Price Range Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70">
                  Price Range
                </label>
                <div className="space-y-1 text-xs">
                  {[
                    { label: 'All Prices', val: 'all' },
                    { label: 'Under ₹300', val: '0-300' },
                    { label: '₹300 to ₹600', val: '300-600' },
                    { label: '₹600 to ₹1,200', val: '600-1200' },
                    { label: 'Above ₹1,200', val: '1200-99999' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setSelectedPricePreset(preset.val)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                        selectedPricePreset === preset.val
                          ? 'bg-[#D7EFFF] text-[#351E28] font-bold'
                          : 'hover:bg-[#F8F7F0] text-[#351E28]/80'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {selectedPricePreset === preset.val && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5C34]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Counter Pickup Notice */}
              <div className="p-3.5 bg-[#F8F7F0] rounded-2xl border border-[#351E28]/10 text-xs text-[#351E28]/80">
                <div className="font-bold text-[#351E28] mb-1">Bangalore Counter Pickup</div>
                Orders placed online can be picked up same day with instant WhatsApp booking.
              </div>

            </div>
          </div>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-9 space-y-5">
            
            {/* Top Toolbar: Search summary & Sort Selector */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#351E28]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-[#EAF05C] text-[#351E28] text-xs font-bold px-3 py-1 rounded-full border border-[#351E28]/15">
                    Category: {activeCategoryObject?.name}
                    <button onClick={() => handleCategorySelect('all')}>
                      <X className="w-3.5 h-3.5 hover:text-[#FF5C34]" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 bg-[#D7EFFF] text-[#351E28] text-xs font-bold px-3 py-1 rounded-full border border-[#351E28]/15">
                    Search: "{searchQuery}"
                    <button onClick={() => handleSearchChange('')}>
                      <X className="w-3.5 h-3.5 hover:text-[#FF5C34]" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 bg-[#AEBBA0]/30 text-[#351E28] text-xs font-bold px-3 py-1 rounded-full border border-[#351E28]/15">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)}>
                      <X className="w-3.5 h-3.5 hover:text-[#FF5C34]" />
                    </button>
                  </span>
                )}

                {selectedPricePreset !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-[#F8F7F0] text-[#351E28] text-xs font-bold px-3 py-1 rounded-full border border-[#351E28]/15">
                    Price Filter Active
                    <button onClick={() => setSelectedPricePreset('all')}>
                      <X className="w-3.5 h-3.5 hover:text-[#FF5C34]" />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort Selector Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-[#351E28]/60 font-semibold shrink-0">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F8F7F0] border border-[#351E28]/15 rounded-xl px-3 py-1.5 text-xs font-bold text-[#351E28] outline-none focus:border-[#FF5C34]"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

            </div>

            {/* Product Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 border-2 border-[#351E28]/10 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[#D7EFFF] border-2 border-[#351E28] mx-auto flex items-center justify-center text-[#351E28] shadow-pop-sm">
                  <PackageOpen className="w-10 h-10 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-black text-[#351E28] mb-1">
                    No matching baking products found
                  </h3>
                  <p className="text-xs sm:text-sm text-[#351E28]/60 max-w-md mx-auto leading-relaxed">
                    We couldn't find any products matching your active filters. Try searching with a broader keyword or reset your filters.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 bg-[#FF5C34] hover:bg-[#e44c26] text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Footer */}
      <StorefrontFooter settings={settings} categories={categories} />

      {/* Cart & Checkout & Product Detail Modals */}
      <CartDrawer />

      <CheckoutModal
        settings={settings}
        onOrderSuccess={(ord, url) => {
          setConfirmedOrder(ord);
          setConfirmedWhatsappUrl(url);
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={settings.whatsappNumber}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        whatsappUrl={confirmedWhatsappUrl}
        settings={settings}
        onClose={() => setConfirmedOrder(null)}
      />

    </div>
  );
}
