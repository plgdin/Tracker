import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Flame, 
  Star
} from 'lucide-react';
import { AnnouncementBar } from '../components/storefront/AnnouncementBar';
import { StorefrontNavbar } from '../components/storefront/StorefrontNavbar';
import { HeroSection } from '../components/storefront/HeroSection';
import { CategoryCards } from '../components/storefront/CategoryCards';
import { ProductCard } from '../components/storefront/ProductCard';
import { ProductDetailModal } from '../components/storefront/ProductDetailModal';
import { CartDrawer } from '../components/storefront/CartDrawer';
import { CheckoutModal } from '../components/storefront/CheckoutModal';
import { OrderConfirmationModal } from '../components/storefront/OrderConfirmationModal';
import { StoreInfoSection } from '../components/storefront/StoreInfoSection';
import { StorefrontFooter } from '../components/storefront/StorefrontFooter';

import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { settingsService } from '../services/settingsService';
import type { Product, Category, StoreSettings, Order } from '../types/ecommerce';
import { INITIAL_SETTINGS } from '../services/mockData';

export default function Home() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Completed order state for confirmation modal
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmedWhatsappUrl, setConfirmedWhatsappUrl] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const [s, cats, products] = await Promise.all([
        settingsService.getSettings(),
        categoryService.getAll(),
        productService.getActive(),
      ]);

      setSettings(s);
      setCategories(cats);
      setFeaturedProducts(products.filter((p) => p.isFeatured));
      setPopularProducts(products.slice(0, 8));
    };

    loadData();
  }, []);

  const handleOrderSuccess = (order: Order, whatsappUrl: string) => {
    setConfirmedOrder(order);
    setConfirmedWhatsappUrl(whatsappUrl);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F0] text-[#351E28] flex flex-col font-body selection:bg-[#EAF05C] selection:text-[#351E28]">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar settings={settings} />

      {/* 2. Main Navigation Bar */}
      <StorefrontNavbar
        settings={settings}
        categories={categories}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* 3. Hero Section */}
      <HeroSection settings={settings} />

      {/* 4. Category Showcase Cards */}
      <CategoryCards categories={categories} />

      {/* 5. Featured Products Section */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#351E28]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF5C34] mb-1">
                <Flame className="w-4 h-4 fill-[#FF5C34] text-[#FF5C34]" />
                Baker's Choice
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#351E28] tracking-tight">
                Featured Baking Essentials
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] group transition-colors"
            >
              <span>See All ({featuredProducts.length}+)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 6. Promotional Banner: Couverture & Decor Special */}
      <section className="py-12 sm:py-16 bg-[#351E28] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5C34]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#EAF05C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-[#EAF05C] text-[#351E28] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-[#351E28]" />
                  Artisan Quality Guaranteed
                </span>

                <h3 className="font-heading text-3xl sm:text-4xl font-black text-white leading-tight">
                  High-Grade Belgian Couverture & Concentrated Oil Colours
                </h3>

                <p className="text-sm text-[#F8F7F0]/80 max-w-2xl leading-relaxed">
                  Looking to craft glossy mirror glazes, chocolate bonbons, or stable fondant figurines? 
                  We supply calibrated Callebaut chocolate callets, Tropelite whipping creams, and 
                  oil-based candy colours formulated for flawless patisserie finishes.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to="/products?category=cat-baking-ingredients"
                    className="inline-flex items-center gap-2 bg-[#FF5C34] hover:bg-[#e44c26] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                    <span>Shop Couverture Chocolate</span>
                  </Link>

                  <Link
                    to="/products?category=cat-colours-flavours"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full border border-white/20 transition-all"
                  >
                    <span>View Colour Palette</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#EAF05C] p-2 rotate-6 shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=500&q=80"
                      alt="Chocolate drops"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-[#FF5C34] text-white text-xs font-black px-3 py-1.5 rounded-2xl shadow-md -rotate-6">
                    ₹590 / 500g
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. Popular Everyday Essentials */}
      <section className="py-12 sm:py-16 bg-[#F8F7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF5C34] mb-1">
                <Star className="w-4 h-4 fill-[#FF5C34] text-[#FF5C34]" />
                Best Rated In Bangalore
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#351E28] tracking-tight">
                Trending In Store
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] group transition-colors"
            >
              <span>Explore Full Store</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 8. Physical Store & Counter Pickup Info */}
      <StoreInfoSection settings={settings} />

      {/* 9. Footer */}
      <StorefrontFooter settings={settings} categories={categories} />

      {/* Modals & Slide-over Drawer */}
      <CartDrawer />

      <CheckoutModal
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
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
