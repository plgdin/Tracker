import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    image: "/hero-1.jpg",
    title: "Premium Culinary Ingredients",
    subtitle: "High-quality flour, oils, sauces, spices, and raw materials for every kitchen.",
  },
  {
    image: "/hero-2.jpg",
    title: "Professional Chef Supplies",
    subtitle: "Baking instruments, cooking utensils, and equipment designed for professionals.",
  },
  {
    image: "/hero-3.jpg",
    title: "Finest Raw Materials & Spices",
    subtitle: "Source premium spices, specialized baking supplies, and essential ingredients.",
  },
  {
    image: "/hero-4.jpg",
    title: "Equip Your Culinary Journey",
    subtitle: "From cooking utensils to premium raw materials, find everything you need to create.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % heroSlides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + heroSlides.length) % heroSlides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section 
      id="hero" 
      className="relative w-full h-[220px] md:h-screen overflow-hidden rounded-b-[40px] md:rounded-b-none"
    >
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:px-6">
        <p className="font-accent text-sm md:text-3xl text-white/90 mb-1 md:mb-4 animate-fade-in-up">
          Premium Ingredients & Chef Supplies
        </p>
        <h1 className="font-heading text-xl md:text-6xl lg:text-7xl font-bold text-white hero-text-shadow max-w-4xl animate-fade-in-up">
          {heroSlides[current].title}
        </h1>
        <p className="mt-2 md:mt-6 text-xs md:text-xl text-white/85 max-w-2xl font-body animate-fade-in-up max-w-[85%] truncate md:whitespace-normal">
          {heroSlides[current].subtitle}
        </p>
      </div>

      {/* Navigation Arrows - Desktop Only */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots - Desktop Only */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-white"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
