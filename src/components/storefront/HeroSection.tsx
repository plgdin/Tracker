import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Sparkles, Heart, Gift, ArrowRight } from 'lucide-react';
import type { StoreSettings } from '../../types/ecommerce';

interface HeroSectionProps {
  settings?: StoreSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  return (
    <section className="relative overflow-hidden bg-[#F9F4EE] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#E8D8CC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Store Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2E7DC] text-[#4A2818] text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A2818]" />
              <span>{settings?.storeName || 'Bake & Joy'} · Bangalore</span>
            </div>

            {/* Main Editorial Serif Headline */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.25rem] font-medium text-[#4A2818] tracking-tight leading-[1.06]">
              Sweet Moments <br />
              <span className="italic font-normal">Start Here</span>
            </h1>

            {/* Editorial Subtext */}
            <p className="text-base sm:text-lg text-[#7A6153] leading-relaxed max-w-lg font-normal">
              Bangalore's dedicated destination for fine baking supplies, calibrated Belgian couverture chocolates, silicone moulds, cake decoration toppers, and artisanal dessert ingredients.
            </p>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <Link
                to="/products"
                className="inline-flex items-center justify-center bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-medium text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <span>Shop Now</span>
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A2818] hover:text-[#7A6153] transition-colors group"
              >
                <span className="text-xs">&gt;</span>
                <span className="underline-offset-4 group-hover:translate-x-0.5 transition-transform">Explore Catalog</span>
              </Link>
            </div>

            {/* Minimal Icon Bar Tray */}
            <div className="pt-6 border-t border-[#E8D8CC]/70 flex items-center gap-3 sm:gap-4 text-[#7A6153]">
              <div 
                className="w-9 h-9 rounded-full border border-[#DCC7B8] flex items-center justify-center bg-[#FCFAF7] hover:bg-[#F2E7DC] hover:text-[#4A2818] transition-colors cursor-pointer"
                title="Baking Packaging"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div 
                className="w-9 h-9 rounded-full border border-[#DCC7B8] flex items-center justify-center bg-[#FCFAF7] hover:bg-[#F2E7DC] hover:text-[#4A2818] transition-colors cursor-pointer"
                title="Store Inquiries"
              >
                <Mail className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div 
                className="w-9 h-9 rounded-full border border-[#DCC7B8] flex items-center justify-center bg-[#FCFAF7] hover:bg-[#F2E7DC] hover:text-[#4A2818] transition-colors cursor-pointer"
                title="Artisanal Decor"
              >
                <Sparkles className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div 
                className="w-9 h-9 rounded-full border border-[#DCC7B8] flex items-center justify-center bg-[#FCFAF7] hover:bg-[#F2E7DC] hover:text-[#4A2818] transition-colors cursor-pointer"
                title="Baker's Favorites"
              >
                <Heart className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div 
                className="w-9 h-9 rounded-full border border-[#DCC7B8] flex items-center justify-center bg-[#FCFAF7] hover:bg-[#F2E7DC] hover:text-[#4A2818] transition-colors cursor-pointer"
                title="Gift Sets & Combos"
              >
                <Gift className="w-4 h-4 stroke-[1.8]" />
              </div>
            </div>

          </div>

          {/* Right Column: Artisan Strawberry Cake on Ceramic Dish */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative max-w-sm sm:max-w-md w-full">
              
              {/* Soft background ambient halo */}
              <div className="absolute inset-0 bg-[#E8D8CC]/40 rounded-full blur-2xl transform scale-95 pointer-events-none" />

              {/* Ceramic Dish & Strawberry Layer Cake */}
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-square bg-[#FCFAF7] border-2 border-white/80 shadow-2xl p-2.5">
                <img
                  src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=85"
                  alt="Fresh artisan strawberry cream cake"
                  className="w-full h-full object-cover rounded-[2rem] transform hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Artisan Quality Tag */}
                <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-[#E8D8CC] flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A2818] animate-pulse" />
                  <div className="text-left">
                    <div className="text-xs font-serif font-bold text-[#4A2818]">100% Pure Couverture</div>
                    <div className="text-[10px] text-[#7A6153]">Cake & Confectionery Essentials</div>
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
