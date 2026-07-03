import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useCartContext } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Search, Check, Trash2, ChevronDown } from "lucide-react";

const placeholderCategories = [
  { id: "mock-chocolate", name: "Chocolate" },
  { id: "mock-baking", name: "Baking Materials" },
  { id: "mock-decorations", name: "Cake Decorations" },
  { id: "mock-flavors", name: "Flavors" },
];

const mockProducts = [
  {
    id: -1,
    name: "Dark Compound Chocolate",
    description: "Smooth slab for ganache, moulding, and bakery coating.",
    price: "220",
    image: "/cat-chocolate.jpg",
    categoryName: "Chocolate",
    inStock: true,
  },
  {
    id: -2,
    name: "Vanilla Cake Premix",
    description: "Soft sponge base for celebration cakes and cupcakes.",
    price: "180",
    image: "/cat-baking-materials.jpg",
    categoryName: "Baking Materials",
    inStock: true,
  },
  {
    id: -3,
    name: "Gold Sprinkle Mix",
    description: "Ready garnish for cakes, jars, donuts, and desserts.",
    price: "95",
    image: "/cat-cake-decorations.jpg",
    categoryName: "Cake Decorations",
    inStock: true,
  },
  {
    id: -4,
    name: "Strawberry Flavour",
    description: "Bakery-grade flavour for creams, batters, and fillings.",
    price: "140",
    image: "/cat-flavors.jpg",
    categoryName: "Flavors",
    inStock: true,
  },
  {
    id: -5,
    name: "Window Cake Box",
    description: "Sturdy box with display window for clean delivery.",
    price: "35",
    image: "/cat-packaging.jpg",
    categoryName: "Packaging",
    inStock: true,
  },
  {
    id: -6,
    name: "Frozen Puff Sheets",
    description: "Layered pastry sheets for quick bakery prep.",
    price: "260",
    image: "/cat-frozen-food.jpg",
    categoryName: "Frozen Food",
    inStock: true,
  },
];

const AVAILABLE_BRANDS = [
  "Bake & Joy Originals",
  "Puratos",
  "Callebaut",
  "Vizyon",
  "Pillsbury"
];

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useCartContext();

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

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Assign deterministic mock brand to products
  const getProductBrand = (p: any) => {
    const idVal = typeof p.id === 'string'
      ? p.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      : Math.abs(p.id);
    return AVAILABLE_BRANDS[idVal % AVAILABLE_BRANDS.length];
  };

  // Assign deterministic origin to products
  const getProductOrigin = (p: any) => {
    const idVal = typeof p.id === 'string'
      ? p.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
      : Math.abs(p.id);
    return idVal % 2 === 0 ? "Imported" : "Exported";
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: prodData } = await supabase.from('items').select('*');
      if (prodData) {
        const formatted = prodData.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.notes || '',
            price: p.price || 0,
            image: p.image_url || null,
            categoryName: p.category,
            inStock: p.quantity > 0
        }));
        const itemsList = formatted.length > 0 ? formatted : mockProducts;
        setProducts(itemsList);
        const calculatedMax = Math.max(...itemsList.map(item => Math.ceil(parseFloat(item.price) || 0)), 300);
        setMaxPriceLimit(calculatedMax);
        setPriceLimit(calculatedMax);
      } else {
        setProducts(mockProducts);
        const calculatedMax = Math.max(...mockProducts.map(item => Math.ceil(parseFloat(item.price) || 0)), 300);
        setMaxPriceLimit(calculatedMax);
        setPriceLimit(calculatedMax);
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
    const pBrand = getProductBrand(p);
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(pBrand);

    // Origin check
    const pOrigin = getProductOrigin(p);
    const matchOrigin = selectedOrigins.length === 0 || selectedOrigins.includes(pOrigin);

    return matchCategory && matchSearch && matchPrice && matchBrand && matchOrigin;
  });

  const displayedCategories = categories.length > 0 ? categories : placeholderCategories;

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
      />

      {/* Products & Filters Layout */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-8">
        

        {/* Top Right Product Count Pill */}
        <div className="flex justify-end mb-6">
          <span className="px-4 py-1.5 bg-white/80 border border-espresso/5 shadow-soft rounded-full text-xs font-bold text-taupe">
            Showing <span className="text-burnt-orange">{filteredProducts.length}</span> products
          </span>
        </div>

        {/* Main Grid & Sidebar Flex */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Left Sidebar Panel (Always visible, responsive) */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto bg-white/60 lg:backdrop-blur-md lg:shadow-soft lg:rounded-[40px] lg:border lg:border-espresso/5 p-6 rounded-3xl border border-espresso/5 shadow-soft">
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
                  {["Imported", "Exported"].map((origin) => {
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-tl-[10px] rounded-tr-[50px] rounded-br-[10px] rounded-bl-[50px] overflow-hidden shadow-soft animate-pulse"
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                {displayedCategories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="block text-white/60 hover:text-burnt-orange transition-colors text-sm text-left"
                  >
                    {cat.name}
                  </button>
                ))}
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



      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
