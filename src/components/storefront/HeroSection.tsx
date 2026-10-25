import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero';
import { INITIAL_PRODUCTS } from '../../services/mockData';
import type { StoreSettings } from '../../types/ecommerce';

interface HeroSectionProps {
  settings?: StoreSettings;
}

// Actual items from the bakery store catalog
const BAKERY_ITEM_TILES = INITIAL_PRODUCTS.map((prod) => ({
  src: prod.images[0],
  alt: prod.name,
}));

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#F9F4EE]">
      <TiltedGridHero
        images={BAKERY_ITEM_TILES}
        speed={4.2}
        tileHeight={30}
        aspectRatio={16 / 9}
        gap={6}
        axis={56}
        curve={78}
        fade={14}
        className="w-full h-[580px] sm:h-[620px] lg:h-[660px] border-b border-[#E8D8CC]/60 bg-[#F9F4EE]"
      >
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-10 sm:py-14 text-center max-w-4xl mx-auto px-4 sm:px-6 pointer-events-none">
          
          {/* Top Title & Headline */}
          <div className="space-y-3 sm:space-y-4 pt-2">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.75rem] font-medium text-[#4A2818] tracking-tight leading-[1.04] drop-shadow-xs">
              Sweet Moments <br />
              <span className="italic font-normal">Start Here</span>
            </h1>
          </div>

          {/* Bottom Subtext & Action Buttons */}
          <div className="space-y-5 pb-2 sm:pb-4 flex flex-col items-center">
            <p className="text-sm sm:text-base text-[#5A3825] max-w-lg leading-relaxed font-normal bg-[#F9F4EE]/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-[#E8D8CC] shadow-xs">
              Trivandrum's dedicated destination for fine baking supplies, calibrated Belgian couverture chocolates, silicone moulds, and artisanal dessert essentials.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-medium text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Supplies</span>
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A2818] bg-[#F2E7DC] hover:bg-[#EAD9CF] px-6 py-3.5 rounded-full transition-colors border border-[#DCC7B8]"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </TiltedGridHero>
    </section>
  );
};

export default HeroSection;
