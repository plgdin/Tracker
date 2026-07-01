import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useCartContext } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Sparkles,
  Tag,
  Truck,
  Clock,
  Headphones,
  ChevronRight,
  Star,
} from "lucide-react";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  useCartContext();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      // Fetch Products
      let query = supabase.from('items').select('*');
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data: prodData } = await query;
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
        setProducts(formatted);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [selectedCategory, searchQuery]);

  const featuredProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(0, 4);
  const offersList: any[] = []; // Currently no offers in schema

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
  }, [products, recommendedProducts]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* Hero */}
      <HeroCarousel />

      {/* Stats Banner */}
      <section className="py-8 bg-white border-y border-espresso/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders above Rs.500" },
              { icon: Clock, label: "Same Day", sub: "Dispatch available" },
              { icon: Headphones, label: "24/7 Support", sub: "Via WhatsApp" },
              { icon: Star, label: "Premium Quality", sub: "Handpicked products" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-6 h-6 text-burnt-orange" />
                </div>
                <div>
                  <p className="font-semibold text-espresso text-sm">
                    {stat.label}
                  </p>
                  <p className="text-xs text-taupe">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-accent text-2xl text-burnt-orange mb-2">
              Browse by category
            </p>
            <h2 className="font-heading text-4xl font-bold text-espresso">
              What are you looking for?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.name ? undefined : cat.name
                  )
                }
                className={`group relative rounded-2xl overflow-hidden aspect-square transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? "ring-4 ring-burnt-orange shadow-card"
                    : "shadow-soft hover:shadow-card"
                }`}
              >
                <div className="w-full h-full bg-espresso/5 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {cat.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="font-accent text-2xl text-burnt-orange mb-2">
                Bestsellers
              </p>
              <h2 className="font-heading text-4xl font-bold text-espresso">
                Fan Favorites
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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

      {/* Recommended Products */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <section className="py-16 px-6 bg-cream border-t border-espresso/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="font-accent text-2xl text-burnt-orange mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-burnt-orange" /> Recommended for You
              </p>
              <h2 className="font-heading text-4xl font-bold text-espresso">
                Personalized Picks
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {recommendedProducts.map((product) => (
                <div key={`recommended-${product.id}`} className="reveal">
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
      <section id="products" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-accent text-2xl text-burnt-orange mb-2">
              Our collection
            </p>
            <h2 className="font-heading text-4xl font-bold text-espresso">
              All Products
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-espresso/15 bg-white focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? "bg-burnt-orange text-white"
                    : "bg-white text-espresso border border-espresso/15 hover:border-burnt-orange"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? "bg-burnt-orange text-white"
                      : "bg-white text-espresso border border-espresso/15 hover:border-burnt-orange"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-soft animate-pulse"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products?.map((product) => (
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

          {products?.length === 0 && !isLoading && (
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

      {/* Offers Section */}
      <section id="offers" className="py-16 px-6 bg-dark-chocolate">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-accent text-2xl text-burnt-orange mb-2">
              Special deals
            </p>
            <h2 className="font-heading text-4xl font-bold text-white">
              Current Offers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {offersList?.map((offer) => (
              <div
                key={offer.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all reveal"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-burnt-orange/20 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-7 h-7 text-burnt-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-semibold text-white mb-1">
                      {offer.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-burnt-orange/20 text-burnt-orange rounded-full text-sm font-mono font-bold">
                        {offer.code}
                      </span>
                      <span className="text-white/40 text-sm">
                        Min: Rs.{offer.minOrderAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(!offersList || offersList.length === 0) && (
              <div className="col-span-2 text-center py-8">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No active offers at the moment</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="font-accent text-2xl text-burnt-orange mb-2">
              Simple process
            </p>
            <h2 className="font-heading text-4xl font-bold text-espresso">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Browse",
                desc: "Explore our wide range of baking supplies and decorations",
              },
              {
                step: "02",
                title: "Add to Cart",
                desc: "Select your favorite items and add them to your cart",
              },
              {
                step: "03",
                title: "Checkout",
                desc: "Fill in your details and choose pickup or delivery",
              },
              {
                step: "04",
                title: "Pay via QR",
                desc: "Complete payment through the owner's QR code",
              },
            ].map((item, i) => (
              <div key={i} className="text-center reveal">
                <div className="w-16 h-16 rounded-2xl bg-burnt-orange/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-2xl font-bold text-burnt-orange">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-espresso mb-2">
                  {item.title}
                </h3>
                <p className="text-taupe text-sm">{item.desc}</p>
                {i < 3 && (
                  <ChevronRight className="w-6 h-6 text-taupe/30 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-12 px-6">
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
                <button
                  onClick={() =>
                    document
                      .getElementById("hero")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
                >
                  Home
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
                >
                  Products
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("offers")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
                >
                  Offers
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                {categories?.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="block text-white/60 hover:text-burnt-orange transition-colors text-sm"
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
