import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, ChefHat } from "lucide-react";
import { useCartContext } from "@/context/CartContext";

interface NavbarProps {
  onCartClick: () => void;
}

export default function Navbar({ onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCartContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? "w-[95%] max-w-6xl bg-white/90 backdrop-blur-xl shadow-card"
          : "w-[95%] max-w-6xl bg-white/70 backdrop-blur-md"
      } rounded-full px-4 md:px-6 py-3`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2"
        >
          <ChefHat className="w-7 h-7 text-burnt-orange" />
          <span className="font-heading text-xl font-bold text-espresso hidden sm:inline">
            Bake & Joy
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("categories")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Categories
          </button>
          <button
            onClick={() => scrollToSection("products")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Products
          </button>
          <button
            onClick={() => scrollToSection("offers")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Offers
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCartClick}
            className="relative p-2 rounded-full hover:bg-espresso/5 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-espresso" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-burnt-orange text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href="/login"
            className="p-2 rounded-full hover:bg-espresso/5 transition-colors hidden sm:block"
          >
            <User className="w-5 h-5 text-espresso" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-espresso/5 transition-colors md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-espresso" />
            ) : (
              <Menu className="w-5 h-5 text-espresso" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-espresso/10 pt-4 animate-fade-in-up">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("categories")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Categories
            </button>
            <button
              onClick={() => scrollToSection("products")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("offers")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Offers
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
