import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Package, 
  PhoneCall 
} from 'lucide-react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import type { StoreSettings } from '../../types/ecommerce';

interface HeroSectionProps {
  settings?: StoreSettings;
}

interface PromoSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  fallbackImage: string;
}

const HERO_SLIDES: PromoSlide[] = [
  {
    id: 'slide-tools-moulds',
    badge: 'MEGA SAVINGS FEST · UP TO 45% OFF',
    badgeColor: 'bg-[#4A2818] text-[#F9F4EE] border border-[#6D381E]',
    title: 'Professional Baking Tools & Cake Moulds',
    subtitle: 'Silicone geometric moulds, 360° revolving turntables, offset spatulas, stainless steel scrapers, and digital weighing scales for home bakers and commercial kitchens.',
    highlight: 'Over 300+ moulds & tools starting from ₹89',
    ctaText: 'Shop Tools & Bakeware',
    ctaLink: '/products?category=cat-tools-equipment',
    secondaryCtaText: 'View Moulds',
    secondaryCtaLink: '/products?category=cat-moulds-cutters',
    image: '/cat-baking-materials.jpg',
    fallbackImage: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg',
  },
  {
    id: 'slide-chocolates-ingredients',
    badge: 'CHEF CHOCOLATE SALE · FLAT 20% OFF',
    badgeColor: 'bg-[#361B0E] text-[#F9F4EE] border border-[#522914]',
    title: 'Couverture Slabs, Cocoa Powder & Whipping Cream',
    subtitle: 'Authentic Morde, Van Houten & 2M compound chocolates, dark couverture callets, Dutch-process cocoa powders, non-dairy whipping cream, and filling creams.',
    highlight: 'Fresh stock in 500g retail & bulk 5kg cartons',
    ctaText: 'Shop Ingredients & Cocoa',
    ctaLink: '/products?category=cat-baking-ingredients',
    secondaryCtaText: 'Whipping Creams',
    secondaryCtaLink: '/products?category=cat-creams-frosting',
    image: '/cat-chocolate.jpg',
    fallbackImage: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg',
  },
  {
    id: 'slide-boxes-packaging',
    badge: 'WHOLESALE PACKAGING · STARTING AT ₹15',
    badgeColor: 'bg-[#4A2818] text-[#F9F4EE] border border-[#6D381E]',
    title: 'Crystal Window Cake Boxes & Heavy Boards',
    subtitle: 'Tall transparent display cake boxes, greaseproof cupcake inserts, heavy-duty gold base masonite boards, and premium gift packaging at wholesale prices.',
    highlight: 'Volume packs available for home bakers & cloud kitchens',
    ctaText: 'Explore Cake Boxes',
    ctaLink: '/products?category=cat-packaging-supplies',
    secondaryCtaText: 'See All Supplies',
    secondaryCtaLink: '/products',
    image: '/cat-packaging.jpg',
    fallbackImage: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg',
  },
  {
    id: 'slide-colours-decorations',
    badge: 'DECORATORS FEST · COMBO OFFERS',
    badgeColor: 'bg-[#361B0E] text-[#F9F4EE] border border-[#522914]',
    title: 'Russian Nozzles, Gel Colours & Cake Toppers',
    subtitle: 'Magic Colours concentrated gel pigments, edible luster dust, acrylic celebration toppers, piping nozzles, and sprinkles for high-end dessert styling.',
    highlight: 'Buy Any 2 Decor Sets & Enjoy Extra 10% Off',
    ctaText: 'Grab Decor Deals',
    ctaLink: '/products?category=cat-cake-decoration',
    secondaryCtaText: 'Gel Colours & Flavours',
    secondaryCtaLink: '/products?category=cat-colours-flavours',
    image: '/cat-cake-decorations.jpg',
    fallbackImage: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg',
  },
  {
    id: 'slide-dates-dryfruits',
    badge: 'FRESH HARVEST · SPECIAL WHOLESALE PRICES',
    badgeColor: 'bg-[#4A2818] text-[#F9F4EE] border border-[#6D381E]',
    title: 'Happilo International Dates, Almonds & Seeds',
    subtitle: 'Queen Kalmi & Medjoul dates, Mamra almonds, cashews, cranberries, chia seeds, and sunflower seeds for rich bakery fillings and confectionery gifts.',
    highlight: 'Wholesale & retail packs directly at Kazhakuttam',
    ctaText: 'Shop Dry Fruits & Nuts',
    ctaLink: '/products?category=cat-dry-fruits',
    secondaryCtaText: 'View All Deals',
    secondaryCtaLink: '/products',
    image: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg',
    fallbackImage: '/cat-baking-materials.jpg',
  },
];

const BENEFIT_ITEMS = [
  {
    icon: Tag,
    title: 'Wholesale & Retail',
    subtitle: 'Special pricing for home bakers',
  },
  {
    icon: Layers,
    title: '1,000+ Baking Items',
    subtitle: 'Tools, moulds & raw materials',
  },
  {
    icon: Package,
    title: 'Cake Boxes & Boards',
    subtitle: 'Transparent window boxes & bases',
  },
  {
    icon: CheckCircle2,
    title: 'Kazhakuttam Showroom',
    subtitle: 'Quick pickup & local dispatch',
  },
  {
    icon: Sparkles,
    title: 'Couverture & Compounds',
    subtitle: 'Morde, Van Houten & 2M slabs',
  },
  {
    icon: ShoppingBag,
    title: '100% Food-Grade Bakeware',
    subtitle: 'Certified silicone & heavy pans',
  },
  {
    icon: PhoneCall,
    title: 'WhatsApp Fast Orders',
    subtitle: 'Instant counter order desk',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-advance every 5.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#2C1810]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Promotions and Baking Supplies Offers"
    >
      {/* 1. Amazon-style Full-Width Slideshow Container */}
      <div className="relative w-full h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] overflow-hidden select-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Photo with Dark Gradient Wash for High Readability */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== slide.fallbackImage) {
                      target.src = slide.fallbackImage;
                    }
                  }}
                  className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Multi-layered Amazon-style Contrast Overlays */}
                {/* 1. Deep cocoa tint from left to right for text clarity */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#221008]/95 via-[#2E150B]/85 sm:via-[#2E150B]/70 to-[#221008]/40" />

                {/* 2. Top-to-bottom gentle gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#221008]/70 via-transparent to-[#221008]/90" />

                {/* 3. Amazon Signature Bottom Gradient Blend into Store Background */}
                <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-[#F9F4EE] via-[#F9F4EE]/60 to-transparent pointer-events-none" />
              </div>

              {/* Slide Content Box */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-20 sm:pb-24">
                <div className="max-w-2xl sm:max-w-3xl space-y-3 sm:space-y-4 text-left">
                  
                  {/* Offer Pill Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wide uppercase shadow-md">
                    <span className={`px-2.5 py-0.5 rounded-full ${slide.badgeColor}`}>
                      {slide.badge}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[#EAD9CF] font-medium text-xs">
                      <Tag className="w-3.5 h-3.5 text-[#E39829]" />
                      Limited Period Offer
                    </span>
                  </div>

                  {/* Main Product/Store Headline */}
                  <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#FFF8F0] tracking-tight leading-[1.12] drop-shadow-md">
                    {slide.title}
                  </h1>

                  {/* Subtitle / Descriptive Copy specifically for baking supplies store */}
                  <p className="text-xs sm:text-sm md:text-base text-[#F4ECE4]/95 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
                    {slide.subtitle}
                  </p>

                  {/* Deal Highlight Bar */}
                  <div className="inline-flex items-center gap-2 bg-[#2E150B]/90 backdrop-blur-md border border-[#522914] px-3.5 py-1.5 rounded-xl shadow-xs">
                    <Sparkles className="w-4 h-4 text-[#EAD9CF] shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[#F9F4EE]">
                      {slide.highlight}
                    </span>
                  </div>

                  {/* CTA Action Buttons */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto">
                    <Link
                      to={slide.ctaLink}
                      style={{ color: '#F9F4EE' }}
                      className="inline-flex items-center justify-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] border border-[#6D381E] font-medium text-xs sm:text-sm px-6 py-3 sm:px-8 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#F9F4EE]" />
                      <span>{slide.ctaText}</span>
                    </Link>

                    {slide.secondaryCtaText && slide.secondaryCtaLink && (
                      <Link
                        to={slide.secondaryCtaLink}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#4A2818] bg-[#F2E7DC] hover:bg-[#EAD9CF] px-5 py-3 sm:px-6 sm:py-3.5 rounded-full transition-colors border border-[#DCC7B8] shadow-sm active:scale-95"
                      >
                        <span>{slide.secondaryCtaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#4A2818]" />
                      </Link>
                    )}

                    <a
                      href={`https://wa.me/91${(settings?.whatsappNumber || '9995551234').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hi ${settings?.storeName || 'NayaKart'}, I saw your ${slide.title} offer online. Can you please share the price list and bulk discount rates?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#F9F4EE] bg-[#361B0E]/90 hover:bg-[#4A2818] px-4 py-3 sm:px-5 sm:py-3.5 rounded-full transition-colors border border-[#522914] shadow-sm active:scale-95"
                      title="Enquire wholesale price on WhatsApp"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#EAD9CF]" />
                      <span className="hidden xs:inline">WhatsApp Enquiries</span>
                      <span className="xs:hidden">Enquire</span>
                    </a>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* 2. Amazon-style Previous and Next Side Nav Buttons */}
        <button
          onClick={prevSlide}
          aria-label="Previous Offer Slide"
          className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#EAD9CF]"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Offer Slide"
          className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#EAD9CF]"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 3. Amazon-style Slide Indicators & Counter */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              className={`transition-all duration-300 rounded-full h-2 focus:outline-none ${
                index === currentSlide
                  ? 'w-7 sm:w-8 bg-[#F9F4EE]'
                  : 'w-2 bg-white/40 hover:bg-white/75'
              }`}
            />
          ))}
          <span className="text-[10px] font-mono text-white/70 ml-1.5 border-l border-white/20 pl-2">
            {currentSlide + 1}/{totalSlides}
          </span>
        </div>
      </div>

      {/* 4. Infinite Slider Benefit Ribbon (Sticky to the original warm cocoa & cream theme!) */}
      <div className="relative z-20 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative bg-[#FCFAF7] border border-[#E8D8CC] rounded-2xl p-2.5 sm:p-3.5 shadow-xl overflow-hidden">
          {/* Subtle gradient edge masks for seamless entry & exit */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-[#FCFAF7] via-[#FCFAF7]/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#FCFAF7] via-[#FCFAF7]/80 to-transparent z-10" />

          <InfiniteSlider gap={16} duration={28} durationOnHover={55} className="w-full py-1">
            {BENEFIT_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2 bg-[#F9F4EE]/80 hover:bg-[#F2E7DC] transition-colors rounded-xl border border-[#E8D8CC]/80 shrink-0 select-none cursor-default"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F5EBE1] text-[#4A2818] flex items-center justify-center shrink-0 border border-[#E8D8CC]">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A2818]" />
                </div>
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#4A2818] leading-tight whitespace-nowrap">
                    {item.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#7A6153] leading-tight mt-0.5 whitespace-nowrap">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
