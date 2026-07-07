import { useState, useEffect } from "react";
import type { Category, Item } from "@/lib/db";
import type { FormattedProduct } from "./Home";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useCartContext } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Search, Check, Trash2, ChevronDown, ArrowLeft, SlidersHorizontal, LayoutGrid, Coins, Tag, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";

// Removed mock products and placeholder categories
const CustomCheckbox = ({ checked }: { checked: boolean }) => {
  return (
    <div className={`relative w-5 h-5 rounded-md border-2 flex items-center justify-center overflow-hidden transition-all duration-300 shrink-0 ${
      checked ? "border-burnt-orange bg-burnt-orange shadow-sm" : "border-espresso/30 bg-espresso/5 group-hover:border-espresso/50"
    }`}>
      <div
        className={`absolute inset-0 bg-burnt-orange transition-transform duration-300 origin-center ${
          checked ? "scale-100" : "scale-0"
        }`}
      />
      <Check
        className={`w-3.5 h-3.5 text-white relative z-10 transition-opacity duration-200 ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

const CheckboxOption = ({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-taupe hover:text-espresso hover:bg-espresso/5 transition-colors text-left group"
    >
      <CustomCheckbox checked={checked} />
      <span className={checked ? "text-espresso font-semibold" : ""}>{label}</span>
    </button>
  );
};

export default function Products() {
  const { setIsCartOpen } = useCartContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [location.search]);

  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<string>("category");

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [priceLimit, setPriceLimit] = useState<number>(500);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(500);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]); // "Imported", "Exported"

  // Dropdown Open States (inline push-down dropdowns)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isOriginMenuOpen, setIsOriginMenuOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<FormattedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const AVAILABLE_BRANDS = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
  const AVAILABLE_ORIGINS = Array.from(new Set(products.map(p => p.origin).filter(Boolean)));

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data: catData } = await supabase.from('categories').select('*').eq('store_type', 'online');
      if (catData) setCategories(catData as Category[]);

      const { data: prodData } = await supabase.from('items').select('*').eq('store_type', 'online');
      if (prodData) {
        const formatted = (prodData as (Item & { brand?: string; origin?: string })[]).map((p, index: number) => ({
            id: p.id,
            name: p.name,
            description: p.notes || '',
            price: String(p.price || 0),
            image: p.image_url || null,
            categoryName: p.category,
            inStock: p.quantity > 0,
            brand: p.brand || "",
            origin: p.origin || (index % 2 === 0 ? "Imported" : "Exported"),
            gstPercentage: p.gst_percentage || 0,
        }));
        setProducts(formatted);
        if (formatted.length > 0) {
          const calculatedMax = Math.max(...formatted.map((item) => Math.ceil(parseFloat(item.price as string) || 0)), 300);
          setMaxPriceLimit(calculatedMax);
          setPriceLimit(calculatedMax);
        }
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = !selectedCategory || p.categoryName === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Price range check
    const priceNum = parseFloat(p.price) || 0;
    const matchPrice = priceNum <= priceLimit;

    // Brand check
    const pBrand = p.brand;
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(pBrand);

    // Origin check
    const pOrigin = p.origin;
    const matchOrigin = selectedOrigins.length === 0 || selectedOrigins.includes(pOrigin);

    // In stock check
    const matchInStock = !inStockOnly || p.inStock;

    return matchCategory && matchSearch && matchPrice && matchBrand && matchOrigin && matchInStock;
  });

  const displayedCategories = categories;

   const hasActiveFilters = 
    selectedCategory !== undefined || 
    priceLimit < maxPriceLimit || 
    selectedBrands.length > 0 ||
    selectedOrigins.length > 0;

  const resetFilters = () => {
    setSelectedCategory(undefined);
    setPriceLimit(maxPriceLimit);
    setSelectedBrands([]);
    setSelectedOrigins([]);
  };

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("opacity-0");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [products, filteredProducts]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
      />

      {/* Products & Filters Layout */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 md:pt-16 pb-8">
        

        {/* Desktop Top Right Product Count Pill */}
        <div className="hidden lg:flex justify-end mb-6">
          <span className="px-4 py-1.5 bg-white/80 border border-espresso/5 shadow-soft rounded-full text-xs font-bold text-taupe">
            Showing <span className="text-burnt-orange">{filteredProducts.length}</span> products
          </span>
        </div>

        {/* Mobile Filters Trigger & Count */}
        <div className="lg:hidden flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-transparent text-espresso hover:text-burnt-orange font-bold text-sm transition-all duration-200 shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-burnt-orange shrink-0 transition-colors duration-200" />
            <span>Filters</span>
            {((selectedCategory !== undefined ? 1 : 0) + (priceLimit < maxPriceLimit ? 1 : 0) + selectedBrands.length + selectedOrigins.length) > 0 && (
              <span className="bg-burnt-orange text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {(selectedCategory !== undefined ? 1 : 0) + (priceLimit < maxPriceLimit ? 1 : 0) + selectedBrands.length + selectedOrigins.length}
              </span>
            )}
          </button>
          <span className="px-3.5 py-1.5 bg-white/80 border border-espresso/5 shadow-soft rounded-full text-xs font-bold text-taupe shrink-0">
            Showing <span className="text-burnt-orange">{filteredProducts.length}</span> products
          </span>
        </div>

        {/* Main Grid & Sidebar Flex */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Left Sidebar Panel (Desktop Only) */}
          <aside className="hidden lg:block w-full lg:w-72 shrink-0 lg:sticky lg:top-28 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto bg-white/60 lg:backdrop-blur-md lg:shadow-soft lg:rounded-[40px] lg:border lg:border-espresso/5 p-6 rounded-3xl border border-espresso/5 shadow-soft">
            <div className="space-y-6">
              
              {/* Category Dropdown */}
              <div>
                <h3 className="text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                  Category
                </h3>
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-espresso/15 rounded-2xl text-sm font-semibold text-espresso hover:border-burnt-orange transition-all shadow-sm"
                >
                  <span>{selectedCategory || "All Categories"}</span>
                  <ChevronDown className={`w-4 h-4 text-taupe transition-transform duration-300 ${isCategoryMenuOpen ? "rotate-180" : ""}`} />
                </button>
                
                <div
                  className={`mt-2 overflow-hidden transition-all duration-300 bg-white border rounded-2xl ${
                    isCategoryMenuOpen
                      ? "max-h-[250px] opacity-100 p-2 border-espresso/10 shadow-sm"
                      : "max-h-0 opacity-0 p-0 border-transparent pointer-events-none"
                  } overflow-y-auto`}
                >
                  <CheckboxOption
                    label="All Categories"
                    checked={selectedCategory === undefined}
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setIsCategoryMenuOpen(false);
                    }}
                  />
                  {displayedCategories.map((cat) => (
                    <CheckboxOption
                      key={cat.id}
                      label={cat.name}
                      checked={selectedCategory === cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setIsCategoryMenuOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range Slider (Always Visible, Non-Dropdown) */}
              <div>
                <h3 className="text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                  Price Range
                </h3>
                <div className="bg-white border border-espresso/10 rounded-2xl p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-espresso">
                      <span>₹0</span>
                      <span className="text-burnt-orange bg-burnt-orange/10 px-2 py-0.5 rounded-md">Max: ₹{priceLimit}</span>
                      <span>₹{maxPriceLimit}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPriceLimit}
                      step="5"
                      value={priceLimit}
                      onChange={(e) => setPriceLimit(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-espresso/10 rounded-lg appearance-none cursor-pointer accent-burnt-orange focus:outline-none focus:ring-2 focus:ring-burnt-orange/20"
                    />
                  </div>
                </div>
              </div>

              {/* Brands Dropdown */}
              <div>
                <h3 className="text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                  Brand
                </h3>
                <button
                  onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-espresso/15 rounded-2xl text-sm font-semibold text-espresso hover:border-burnt-orange transition-all shadow-sm"
                >
                  <span>
                    {selectedBrands.length === 0
                      ? "All Brands"
                      : selectedBrands.length === 1
                      ? selectedBrands[0]
                      : `${selectedBrands.length} Brands Selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-taupe transition-transform duration-300 ${isBrandMenuOpen ? "rotate-180" : ""}`} />
                </button>
                
                <div
                  className={`mt-2 overflow-hidden transition-all duration-300 bg-white border rounded-2xl ${
                    isBrandMenuOpen
                      ? "max-h-[250px] opacity-100 p-2 border-espresso/10 shadow-sm"
                      : "max-h-0 opacity-0 p-0 border-transparent pointer-events-none"
                  } overflow-y-auto`}
                >
                  {AVAILABLE_BRANDS.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <CheckboxOption
                        key={brand}
                        label={brand}
                        checked={isChecked}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                          } else {
                            setSelectedBrands([...selectedBrands, brand]);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Origin Dropdown */}
              <div>
                <h3 className="text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                  Origin
                </h3>
                <button
                  onClick={() => setIsOriginMenuOpen(!isOriginMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-espresso/15 rounded-2xl text-sm font-semibold text-espresso hover:border-burnt-orange transition-all shadow-sm"
                >
                  <span>
                    {selectedOrigins.length === 0
                      ? "All Origins"
                      : selectedOrigins.length === 1
                      ? selectedOrigins[0]
                      : `${selectedOrigins.length} Selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-taupe transition-transform duration-300 ${isOriginMenuOpen ? "rotate-180" : ""}`} />
                </button>
                
                <div
                  className={`mt-2 overflow-hidden transition-all duration-300 bg-white border rounded-2xl ${
                    isOriginMenuOpen
                      ? "max-h-[250px] opacity-100 p-2 border-espresso/10 shadow-sm"
                      : "max-h-0 opacity-0 p-0 border-transparent pointer-events-none"
                  } overflow-y-auto`}
                >
                  {AVAILABLE_ORIGINS.map((origin: string) => {
                    const isChecked = selectedOrigins.includes(origin);
                    return (
                      <CheckboxOption
                        key={origin}
                        label={origin}
                        checked={isChecked}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedOrigins(selectedOrigins.filter((o) => o !== origin));
                          } else {
                            setSelectedOrigins([...selectedOrigins, origin]);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Reset Action */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-espresso/5 hover:bg-espresso/10 text-espresso hover:text-burnt-orange rounded-xl text-sm font-semibold transition-all mt-4"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0 transition-all duration-300">
            
            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-tl-[10px] rounded-tr-[30px] md:rounded-tr-[50px] rounded-br-[10px] rounded-bl-[30px] md:rounded-bl-[50px] overflow-hidden shadow-soft animate-pulse"
                  >
                    <div className="aspect-square bg-espresso/10" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-espresso/10 rounded w-3/4" />
                      <div className="h-3 bg-espresso/10 rounded w-1/2" />
                      <div className="h-6 bg-espresso/10 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="reveal">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      image={product.image}
                      categoryName={product.categoryName}
                      inStock={product.inStock}
                      gstPercentage={product.gstPercentage}
                    />
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-20 bg-white/40 border border-espresso/5 rounded-[40px] shadow-soft">
                <Search className="w-16 h-16 text-taupe/30 mx-auto mb-4" />
                <p className="text-espresso font-bold text-lg">No products found</p>
                <p className="text-taupe text-sm mt-1">
                  Try adjusting your search queries or active filters.
                </p>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Mobile Filter Full Screen View */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-cream flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="bg-white border-b border-espresso/10 px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-espresso/5 text-espresso"
              >
                <ArrowLeft className="w-5 h-5 text-espresso" />
              </button>
              <h2 className="font-sans text-lg font-bold text-espresso tracking-tight">Filters and sorting</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-taupe hover:text-burnt-orange transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Dual Panel Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Vertical Tabs Navigation */}
            <div className="w-32 bg-white border-r border-espresso/10 flex flex-col overflow-y-auto shrink-0">
              {[
                { id: "category", label: "Category", icon: LayoutGrid },
                { id: "price", label: "Price Range", icon: Coins },
                { id: "brand", label: "Brand", icon: Tag },
                { id: "origin", label: "Origin", icon: Globe },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeMobileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMobileTab(tab.id)}
                    className={`flex flex-col items-center justify-center h-24 shrink-0 px-2 transition-all text-center gap-2 relative ${
                      isActive 
                        ? "text-burnt-orange font-bold" 
                        : "text-taupe hover:text-espresso"
                    }`}
                    style={{
                      backgroundColor: isActive ? "#FEF2EB" : "transparent",
                      borderLeft: isActive ? "4px solid #D95B35" : "4px solid transparent",
                      borderBottom: "1px solid rgba(61, 43, 31, 0.05)",
                    }}
                  >
                    <TabIcon className={`w-5 h-5 ${isActive ? "text-burnt-orange" : "text-taupe"}`} />
                    <span className="text-xs font-semibold leading-tight tracking-wide">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Pane (Filters Content) */}
            <div className="flex-1 bg-[#FAF7F2] p-5 overflow-y-auto">
              {activeMobileTab === "category" && (
                <div className="space-y-4">
                  <h3 className="font-sans text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                    Select Category
                  </h3>
                  <div className="bg-white rounded-2xl border border-espresso/5 p-3 shadow-sm space-y-1">
                    <CheckboxOption
                      label="All Categories"
                      checked={selectedCategory === undefined}
                      onClick={() => setSelectedCategory(undefined)}
                    />
                    {displayedCategories.map((cat) => (
                      <CheckboxOption
                        key={cat.id}
                        label={cat.name}
                        checked={selectedCategory === cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeMobileTab === "price" && (
                <div className="space-y-4">
                  <h3 className="font-sans text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                    Select Price Range
                  </h3>
                  <div className="bg-white p-4 rounded-2xl border border-espresso/5 shadow-sm space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-espresso">
                      <span>₹0</span>
                      <span className="text-burnt-orange bg-burnt-orange/10 px-2 py-0.5 rounded-md">Max: ₹{priceLimit}</span>
                      <span>₹{maxPriceLimit}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPriceLimit}
                      step="5"
                      value={priceLimit}
                      onChange={(e) => setPriceLimit(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-espresso/10 rounded-lg appearance-none cursor-pointer accent-burnt-orange focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeMobileTab === "brand" && (
                <div className="space-y-4">
                  <h3 className="font-sans text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                    Select Brand
                  </h3>
                  <div className="bg-white rounded-2xl border border-espresso/5 p-3 shadow-sm space-y-1">
                    {AVAILABLE_BRANDS.length === 0 ? (
                      <p className="text-xs text-taupe py-2 text-center">No brands available</p>
                    ) : (
                      AVAILABLE_BRANDS.map((brand) => {
                        const isChecked = selectedBrands.includes(brand);
                        return (
                          <CheckboxOption
                            key={brand}
                            label={brand}
                            checked={isChecked}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                              } else {
                                setSelectedBrands([...selectedBrands, brand]);
                              }
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeMobileTab === "origin" && (
                <div className="space-y-4">
                  <h3 className="font-sans text-xs font-bold text-espresso uppercase tracking-wider mb-2">
                    Select Origin
                  </h3>
                  <div className="bg-white rounded-2xl border border-espresso/5 p-3 shadow-sm space-y-1">
                    {AVAILABLE_ORIGINS.length === 0 ? (
                      <p className="text-xs text-taupe py-2 text-center">No origins available</p>
                    ) : (
                      AVAILABLE_ORIGINS.map((origin: string) => {
                        const isChecked = selectedOrigins.includes(origin);
                        return (
                          <CheckboxOption
                            key={origin}
                            label={origin}
                            checked={isChecked}
                            onClick={() => {
                              if (isChecked) {
                                setSelectedOrigins(selectedOrigins.filter((o) => o !== origin));
                              } else {
                                setSelectedOrigins([...selectedOrigins, origin]);
                              }
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* Footer Apply & Close Button */}
          <div className="bg-white border-t border-espresso/10 p-4 pb-8 shrink-0 flex items-center justify-between gap-4">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="px-6 py-3 text-espresso hover:text-burnt-orange font-bold text-sm transition-colors text-center"
            >
              Close
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="flex-1 py-3 bg-burnt-orange text-white font-bold rounded-xl text-sm hover:bg-[#C44D2A] transition-colors shadow-md text-center"
            >
              Show results
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Bake & Joy
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Your one-stop shop for all baking supplies, decorations, and
                professional bakery equipment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a
                  href="/"
                  className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
                >
                  Home
                </a>
                <a
                  href="/products"
                  className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
                >
                  Products
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-white/60">
                <p>WhatsApp: +91-9876543210</p>
                <p>Store Hours: 9 AM - 8 PM</p>
                <p>Monday - Saturday</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Bake & Joy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
