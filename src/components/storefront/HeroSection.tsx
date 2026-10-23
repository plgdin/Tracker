import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import type { StoreSettings } from '../../types/ecommerce';

interface HeroSectionProps {
  settings?: StoreSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  return (
    <section className="relative overflow-hidden bg-[#F8F7F0] py-8 sm:py-14 border-b border-[#351E28]/10">
      {/* Subtle graphic accent shapes in brand colors */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-[#EAF05C]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-[#D7EFFF]/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Expressive Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#EAF05C] border border-[#351E28]/10 px-3.5 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-[#351E28] fill-[#351E28]" />
              <span className="text-xs font-black tracking-wide uppercase text-[#351E28]">
                {settings?.storeName || 'Bake & Joy'} · Bangalore's Premier Baking Pantry
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#351E28] tracking-tight leading-[1.08]">
              Craft Bakery-Grade <br />
              <span className="text-[#FF5C34]">Magic At Home</span>
            </h1>

            {/* Editorial Subtext */}
            <p className="text-base sm:text-lg text-[#351E28]/80 leading-relaxed max-w-xl font-normal">
              From Belgian couverture chocolate and professional Russian piping nozzles to silicone moulds, 
              cake toppers, and premium packaging. Everything you need for celebration bakes in one curated store.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2.5 bg-[#FF5C34] hover:bg-[#e44c26] text-white font-bold text-base px-7 py-4 rounded-full shadow-lg shadow-[#FF5C34]/25 hover:shadow-xl transition-all duration-200 active:scale-95 group"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                <span>Shop Supplies Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/products?category=cat-cake-decoration"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#D7EFFF] text-[#351E28] font-bold text-base px-6 py-4 rounded-full border-2 border-[#351E28]/15 hover:border-[#351E28]/30 transition-all active:scale-95 shadow-sm"
              >
                <span>Browse Cake Decor</span>
              </Link>
            </div>

            {/* Highlights Bar */}
            <div className="pt-6 border-t border-[#351E28]/10 grid grid-cols-3 gap-3 max-w-lg">
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-black text-[#351E28]">1000+</span>
                <span className="text-xs text-[#351E28]/70 font-semibold">Artisan Supplies</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-black text-[#FF5C34]">100% Fresh</span>
                <span className="text-xs text-[#351E28]/70 font-semibold">Store Quality</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-black text-[#351E28]">Same-Day</span>
                <span className="text-xs text-[#351E28]/70 font-semibold">Bangalore Pickup</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Backing decorative frame */}
              <div className="absolute inset-0 bg-[#351E28] rounded-[2.5rem] rotate-2 transform transition-transform group-hover:rotate-1" />

              {/* Main Image Container */}
              <div className="relative bg-white rounded-[2.25rem] p-3 -rotate-1 border-2 border-[#351E28] shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85"
                  alt="Artisan cake decoration and baking tools"
                  className="w-full h-80 sm:h-96 object-cover rounded-[1.75rem]"
                />

                {/* Floating Wasabi Badge: Store Counter Pick-up */}
                <div className="absolute top-6 left-6 bg-[#EAF05C] border-2 border-[#351E28] text-[#351E28] px-4 py-2 rounded-2xl shadow-md rotate-[-3deg] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#351E28] stroke-[2.5]" />
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider">Fast Counter Pickup</div>
                    <div className="text-[10px] font-bold text-[#351E28]/75">Bangalore Store</div>
                  </div>
                </div>

                {/* Floating Cool Blue Card: Featured Callets */}
                <div className="absolute bottom-6 right-6 bg-[#D7EFFF] border-2 border-[#351E28] p-3 rounded-2xl shadow-lg rotate-[2deg] flex items-center gap-3 max-w-[200px]">
                  <img
                    src="https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=150&q=80"
                    alt="Belgian chocolate"
                    className="w-11 h-11 object-cover rounded-xl border border-[#351E28]/20 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-black text-[#351E28] leading-tight">Dark Couverture</div>
                    <div className="text-[11px] font-bold text-[#FF5C34]">₹590 / 500g</div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
