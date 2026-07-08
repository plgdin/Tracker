import { useState, useEffect } from "react";
import type { Category, Item } from "@/lib/db";

export interface FormattedProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  categoryName: string;
  inStock: boolean;
  brand: string;
  origin: string;
  gstPercentage: number;
  storeSegment: 'hotel' | 'bakery' | 'both';
}
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { useCartContext } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import {
  Search,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const BakeryPattern = ({ dense = false }: { dense?: boolean }) => {
  const baseIcons = [
    { name: "flask-conical", className: "left-[6%] top-10 h-16 w-16 rotate-[-12deg]" },
    { name: "droplet", className: "right-[8%] top-16 h-14 w-14 rotate-[10deg]" },
    { name: "flame", className: "left-[16%] top-[38%] h-12 w-12 rotate-[18deg]" },
    { name: "wheat", className: "right-[22%] top-[46%] h-16 w-16 rotate-[-18deg]" },
    { name: "candy", className: "left-[47%] top-8 h-11 w-11 rotate-[22deg]" },
    { name: "chef-hat", className: "right-[42%] top-[58%] h-14 w-14 rotate-[-8deg]" },
    { name: "cup-soda", className: "left-[31%] top-[27%] h-12 w-12 rotate-[-20deg]" },
    { name: "citrus", className: "right-[31%] top-[18%] h-12 w-12 rotate-[14deg]" },
    { name: "package", className: "left-[38%] top-[70%] h-12 w-12 rotate-[8deg]" },
    { name: "leaf", className: "right-[15%] top-[67%] h-12 w-12 rotate-[-14deg]" },
    { name: "grape", className: "left-[72%] top-[32%] h-12 w-12 rotate-[18deg]" },
    { name: "utensils-crossed", className: "left-[9%] top-[72%] h-12 w-12 rotate-[16deg]" },
    { name: "soup", className: "left-[58%] top-[76%] h-12 w-12 rotate-[-10deg]" },
    { name: "coffee", className: "right-[6%] top-[45%] h-12 w-12 rotate-[12deg]" },
    { name: "milk", className: "left-[24%] top-[62%] h-11 w-11 rotate-[-8deg]" },
    { name: "egg", className: "right-[34%] top-[73%] h-10 w-10 rotate-[20deg]" },
  ];
  const denseIcons = [
    { name: "flask-conical", className: "left-[5%] top-[18%] h-12 w-12 rotate-[18deg]" },
    { name: "droplet", className: "right-[5%] top-[26%] h-12 w-12 rotate-[-12deg]" },
    { name: "pipette", className: "left-[12%] top-[55%] h-10 w-10 rotate-[-8deg]" },
    { name: "candy", className: "right-[13%] top-[58%] h-10 w-10 rotate-[20deg]" },
    { name: "citrus", className: "left-[52%] top-[35%] h-11 w-11 rotate-[-18deg]" },
    { name: "chef-hat", className: "right-[47%] top-[88%] h-12 w-12 rotate-[12deg]" },
    { name: "wheat", className: "left-[70%] top-[82%] h-12 w-12 rotate-[-22deg]" },
    { name: "coffee", className: "left-[28%] top-[84%] h-11 w-11 rotate-[16deg]" },
  ];
  const icons = dense ? [...baseIcons, ...denseIcons] : baseIcons;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {icons.map(({ name, className }, index) => (
        <img
          key={`${name}-${index}`}
          src={`https://api.iconify.design/lucide/${name}.svg?color=%238C8C8C`}
          alt=""
          loading="lazy"
          decoding="async"
          className={`absolute opacity-30 ${className}`}
        />
      ))}
    </div>
  );
};

const categoryImages: Record<string, string> = {
  chocolate: "/cat-chocolate.jpg",
  "baking materials": "/cat-baking-materials.jpg",
  "raw materials": "/cat-baking-materials.jpg",
  "baking ingredients": "/cat-baking-materials.jpg",
  "culinary ingredients": "/cat-baking-materials.jpg",
  "cooking materials": "/cat-baking-materials.jpg",
  "chef supplies": "/cat-baking-materials.jpg",
  "cake decorations": "/cat-cake-decorations.jpg",
  "culinary garnishes": "/cat-cake-decorations.jpg",
  flavors: "/cat-flavors.jpg",
  essences: "/cat-flavors.jpg",
  "essences & flavors": "/cat-flavors.jpg",
  "essences & flavorings": "/cat-flavors.jpg",
  spices: "/cat-flavors.jpg",
  sauces: "/cat-flavors.jpg",
  oils: "/cat-flavors.jpg",
  packaging: "/cat-packaging.jpg",
  "frozen food": "/cat-frozen-food.jpg",
  "gift hampers": "/cat-gift-hampers.jpg",
  "hotel supplies": "/cat-hotel-supplies.jpg",
};

const getCategoryImage = (name: string) =>
  categoryImages[name.toLowerCase()] || "/cat-baking-materials.jpg";

export default function Home() {
  const { setIsCartOpen } = useCartContext();
  const { storeType, clientSegment } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  }, [location.hash]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<FormattedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').eq('store_type', storeType);
      if (catData) setCategories(catData as Category[]);

      // Fetch Products
      const { data: prodData } = await supabase.from('items').select('*').eq('store_type', storeType);
      if (prodData) {
        const formatted = (prodData as (Item & { brand?: string; origin?: string })[]).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.notes || '',
            price: String(p.price || 0),
            image: p.image_url || null,
            categoryName: p.category,
            inStock: p.quantity > 0,
            brand: p.brand || "In-house",
            origin: p.origin || "Local",
            gstPercentage: p.gst_percentage || 0,
            storeSegment: (p as any).store_segment || 'both',
        }));
        setProducts(formatted);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [storeType]);

  // Filter products in memory
  const filteredProducts = products.filter((p) => {
    const matchCategory = !selectedCategory || p.categoryName === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchInStock = !inStockOnly || p.inStock;
    const matchSegment = clientSegment === 'all' || p.storeSegment === 'both' || p.storeSegment === clientSegment;
    return matchCategory && matchSearch && matchInStock && matchSegment;
  });

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 8);
  const featuredProducts = filteredProducts.slice(0, 3);
  const featuredCatName = categories[0]?.name || "Essences";
  const featuredCatProducts = filteredProducts
    .filter((p) => p.categoryName === featuredCatName)
    .slice(0, 4);

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

      {/* Hero */}
      <HeroCarousel />

      {/* Mobile-Only Banners & Favourites */}
      <div className="md:hidden">
        {/* Favourites */}
        {products.length > 0 && (
          <div className="px-4 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-espresso">Trending Favourites</h2>
              <span className="text-xs font-bold text-burnt-orange">Swipe All ➔</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
              {products.slice(0, 6).map((product) => (
                <div key={`fav-${product.id}`} className="w-40 shrink-0">
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
          </div>
        )}
      </div>

      {/* All Products Section */}
      {products && products.length > 0 && (
        <section className="py-16 px-6 bg-white border-b border-espresso/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 reveal">
              <div>
                <span className="px-3 py-1 bg-burnt-orange/10 text-burnt-orange rounded-full text-xs font-bold uppercase tracking-wider">
                  All Products
                </span>
                <h2 className="font-heading text-4xl font-bold text-espresso mt-3">
                  Explore Our Finest Goods
                </h2>
                <p className="text-taupe mt-2 max-w-xl">
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-espresso font-bold text-lg hover:text-burnt-orange hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                View All Goods <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {featuredCatProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {featuredCatProducts.map((product) => (
                  <div key={`feat-cat-${product.id}`} className="reveal">
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
            ) : (
              <div className="text-center py-12 bg-cream/40 rounded-3xl border border-espresso/5">
                <Sparkles className="w-12 h-12 text-burnt-orange/30 mx-auto mb-3" />
                <p className="text-taupe text-sm">
                  No items in this category yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Shop by Category */}
      <section id="categories" className="relative overflow-hidden bg-cream px-6 py-24">
        <BakeryPattern />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-16 text-center reveal">
            <p className="mb-4 font-accent text-3xl text-burnt-orange">
              Shop by category
            </p>
            <h2 className="font-heading text-5xl font-bold text-espresso">
              What are you looking for?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {displayedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === cat.name ? undefined : cat.name
                  );
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative aspect-[1.35/1] overflow-hidden rounded-[50px] border-[8px] border-white transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? "ring-4 ring-burnt-orange shadow-card"
                    : "shadow-soft hover:shadow-card"
                }`}
              >
                <img
                  src={cat.image_url || getCategoryImage(cat.name)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {cat.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {categories.length > 8 && (
            <div className="mt-12 flex justify-center reveal">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-espresso text-lg font-bold hover:text-burnt-orange hover:-translate-y-1 transition-all duration-300"
              >
                {showAllCategories ? "Show less" : "Show more categories"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="font-accent text-2xl text-burnt-orange mb-2">
                Special deals
              </p>
              <h2 className="font-heading text-4xl font-bold text-espresso">
                Current Offers
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
              {featuredProducts.map((product) => (
                <div key={`featured-${product.id}`} className="reveal">
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
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section id="products" className="relative overflow-hidden py-16 px-6 bg-cream">
        <BakeryPattern dense />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-accent text-2xl text-burnt-orange mb-2">
              Featured products
            </p>
            <h2 className="font-heading text-4xl font-bold text-espresso">
              Fresh Picks
            </h2>
          </div>

          {/* Category Filter Tabs (no search input needed here now) */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === undefined
                    ? "text-burnt-orange -translate-y-1"
                    : "text-espresso hover:text-burnt-orange hover:-translate-y-1"
                }`}
              >
                All Items
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
              {filteredProducts?.map((product) => (
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

          {filteredProducts?.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-taupe/30 mx-auto mb-4" />
              <p className="text-taupe text-lg">No products found</p>
              <p className="text-taupe/60 text-sm mt-1">
                Try a different search or category
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
