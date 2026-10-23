import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles,
  ShoppingBag
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
import { LandingIntro } from '../components/storefront/LandingIntro';

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
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);

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
    <div className={`min-h-screen bg-[#F9F4EE] text-[#4A2818] flex flex-col font-sans selection:bg-[#EAD9CF] selection:text-[#4A2818] ${
      isIntroActive ? 'overflow-hidden' : ''
    }`}>
      
      {/* 0. Fullscreen Landing Intro with Centered Logo */}
      {isIntroActive && (
        <LandingIntro
          storeName={settings.storeName || 'Bake & Joy'}
          targetElementId="storefront-navbar-logo"
          onFinished={() => setIsIntroActive(false)}
        />
      )}

      {/* 1. Warm Announcement Bar */}
      <AnnouncementBar settings={settings} />

      {/* 2. Main Artisan Storefront Navigation */}
      <StorefrontNavbar
        settings={settings}
        categories={categories}
        isIntroActive={isIntroActive}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* 3. Hero Section matching user reference image */}
      <HeroSection settings={settings} />

      {/* 4. Category Showcase Cards with circular arrow buttons */}
      <CategoryCards categories={categories} />

      {/* 5. Featured Products Section */}
      <section className="py-16 sm:py-20 bg-[#FCFAF7] border-b border-[#E8D8CC]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6153] mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A2818]" />
                Baker's Choice
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#4A2818] tracking-tight">
                Featured Baking Essentials
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A2818] hover:text-[#7A6153] group transition-colors"
            >
              <span>See All Products ({featuredProducts.length}+)</span>
              <span className="text-xs group-hover:translate-x-1 transition-transform">&gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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

      {/* 6. Signature Studio & Dessert Showcase (Direct match to bottom section of reference image!) */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-[#F2E7DC] via-[#EBDCD2] to-[#F5EBE1] border-b border-[#E8D8CC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Fresh Artisan Strawberry Cupcake on Plate */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-xs sm:max-w-sm w-full">
                <div className="relative rounded-[2.5rem] overflow-hidden aspect-square bg-[#FCFAF7] border-2 border-white/80 shadow-2xl p-3">
                  <img
                    src="https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=85"
                    alt="Artisan dessert and strawberry cupcake"
                    className="w-full h-full object-cover rounded-[2rem] transform hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Right: Editorial Narrative & Circular Arrow Button */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7A6153]">
                Artisan Standard
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#4A2818] tracking-tight leading-[1.12]">
                Service &amp; Studio Supplies
              </h3>

              <p className="text-sm sm:text-base text-[#7A6153] leading-relaxed max-w-xl font-normal">
                Calibrated Belgian chocolate callets, Tropelite whipping creams, fine piping nozzles, and concentrated oil colours formulated for flawless patisserie finishes. Handcrafted for professional dessert studios and passionate home bakers across Bangalore.
              </p>

              {/* Circular Dark Cocoa Button (from reference mockup) */}
              <div className="pt-2">
                <Link
                  to="/products"
                  className="w-12 h-12 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                  title="Explore all bakery studio supplies"
                >
                  <ArrowRight className="w-5 h-5 stroke-[2.2]" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Trending Everyday Essentials */}
      <section className="py-16 sm:py-20 bg-[#F9F4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6153] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#4A2818]" />
                Customer Favorites
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#4A2818] tracking-tight">
                Trending In Store
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A2818] hover:text-[#7A6153] group transition-colors"
            >
              <span>Explore Full Store</span>
              <span className="text-xs group-hover:translate-x-1 transition-transform">&gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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

      {/* 9. Footer in Warm Cocoa Tone */}
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
