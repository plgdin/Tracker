import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    image: "/hero-1.jpg",
    title: "Happiness Baked Fresh",
    subtitle: "Handcrafted pastries, artisan breads, and custom cakes delivered to your door.",
  },
  {
    image: "/hero-2.jpg",
    title: "Premium Baking Supplies",
    subtitle: "Everything you need to create bakery-quality treats at home.",
  },
  {
    image: "/hero-3.jpg",
    title: "From Our Oven to You",
    subtitle: "Quality ingredients and professional tools for every baker.",
  },
  {
    image: "/hero-4.jpg",
    title: "Sweet Moments Start Here",
    subtitle: "Decorate, create, and celebrate with our cake decoration collection.",
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

  const scrollToProducts = () => {
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
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
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="font-accent text-2xl md:text-3xl text-white/90 mb-4 animate-fade-in-up">
          Fresh from the oven
        </p>
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white hero-text-shadow max-w-4xl animate-fade-in-up">
          {heroSlides[current].title}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl font-body animate-fade-in-up">
          {heroSlides[current].subtitle}
        </p>
        <button
          onClick={scrollToProducts}
          className="mt-10 px-8 py-4 bg-burnt-orange text-white font-semibold rounded-full hover:bg-[#C44D2A] transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up"
        >
          Order Now
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
