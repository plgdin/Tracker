import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, ChefHat, Search } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  onCartClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({ onCartClick, searchQuery, setSearchQuery }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCartContext();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavClick = (id: string) => {
    if (id === "products") {
      navigate("/products");
      setMobileMenuOpen(false);
      return;
    }

    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
      setMobileMenuOpen(false);
    }
  };

  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? "w-[95%] max-w-6xl bg-white/90 backdrop-blur-xl shadow-card"
          : "w-[95%] max-w-6xl bg-white/70 backdrop-blur-md"
      } rounded-full px-4 md:px-6 py-3`}
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 shrink-0"
        >
          <ChefHat className="w-7 h-7 text-burnt-orange" />
          <span className="font-accent text-2xl font-semibold text-espresso hidden xl:inline">
            Bake & Joy
          </span>
        </button>

        {/* Desktop Search Bar */}
        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            aria-label="Search products"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input h-10 w-full min-w-0 rounded-full border border-espresso/15 bg-white/70 pl-11 pr-4 text-sm leading-10 outline-none transition-all focus:border-burnt-orange focus:bg-white focus:ring-2 focus:ring-burnt-orange/20"
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-7 shrink-0">
          <button
            onClick={() => handleNavClick("hero")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("categories")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Categories
          </button>
          <button
            onClick={() => handleNavClick("products")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Products
          </button>
          <button
            onClick={() => handleNavClick("offers")}
            className="text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors"
          >
            Offers
          </button>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            id="navbar-cart-btn"
            onClick={onCartClick}
            style={{
              animation: bounce ? "cart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "none"
            }}
            className="group relative p-2 rounded-full hover:bg-espresso/5 transition-colors"
          >
            <ShoppingCart className="w-6 h-6 text-espresso group-hover:text-burnt-orange transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-burnt-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                {totalItems}
              </span>
            )}
          </button>

          <style>{`
            @keyframes cart-pop {
              0% { transform: scale(1); }
              50% { transform: scale(1.3) rotate(-8deg); }
              100% { transform: scale(1); }
            }
          `}</style>

          <a
            href="/login"
            className="group p-2 rounded-full hover:bg-espresso/5 transition-colors hidden sm:block"
          >
            <User className="w-6 h-6 text-espresso group-hover:text-burnt-orange transition-colors" />
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
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              aria-label="Search products"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input h-10 w-full rounded-full border border-espresso/15 bg-white pl-11 pr-4 text-sm leading-10 outline-none transition-all focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20"
            />
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleNavClick("hero")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("categories")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Categories
            </button>
            <button
              onClick={() => handleNavClick("products")}
              className="text-left text-sm font-medium text-espresso/80 hover:text-burnt-orange transition-colors py-2"
            >
              Products
            </button>
            <button
              onClick={() => handleNavClick("offers")}
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
