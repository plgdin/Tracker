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
        className="w-full h-[620px] sm:h-[660px] lg:h-[700px] border-b border-[#E8D8CC]/60 bg-[#F9F4EE]"
      >
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between pt-6 sm:pt-12 pb-8 sm:pb-14 text-center max-w-4xl mx-auto px-4 sm:px-6 pointer-events-none">
          
          {/* Top Title & Headline */}
          <div className="space-y-2 sm:space-y-4 pt-1 sm:pt-2">
            <h1 className="font-serif text-[2.15rem] sm:text-5xl lg:text-[4.75rem] font-medium text-[#4A2818] tracking-tight leading-[1.08] sm:leading-[1.04] drop-shadow-xs">
              Sweet Moments <br />
              <span className="italic font-normal">Start Here</span>
            </h1>
          </div>

          {/* Bottom Subtext & Action Buttons */}
          <div className="space-y-3 sm:space-y-5 flex flex-col items-center">
            <p className="text-xs sm:text-sm md:text-base text-[#5A3825] max-w-xs sm:max-w-lg leading-relaxed font-normal bg-[#F9F4EE]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-[#E8D8CC] shadow-xs">
              Kazhakuttam's trusted specialty retail store for professional baking tools, silicone moulds, cake packaging boxes, couverture chocolate, and raw materials.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
              <Link
                to="/products"
                style={{ color: '#FFFFFF' }}
                className="inline-flex items-center justify-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] !text-white text-white font-medium text-xs sm:text-sm px-6 py-3 sm:px-8 sm:py-3.5 rounded-full shadow-md hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 !text-white text-white" />
                <span className="!text-white text-white font-medium">Shop Supplies</span>
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4A2818] bg-[#F2E7DC] hover:bg-[#EAD9CF] px-5 py-3 sm:px-6 sm:py-3.5 rounded-full transition-colors border border-[#DCC7B8]"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A2818]" />
              </Link>
            </div>
          </div>

        </div>
      </TiltedGridHero>
    </section>
  );
};

export default HeroSection;
