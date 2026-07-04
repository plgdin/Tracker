import { useState, useEffect } from "react";
import { ShoppingCart, User, ChefHat, Search, MapPin, ChevronDown, Compass, Plus, MoreVertical, Home, ArrowLeft, Navigation, Building, Hash, Briefcase, Tag } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Category } from "@/lib/db";

interface SavedAddress {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface NavbarProps {
  onCartClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string | undefined) => void;
  categories?: Category[];
  inStockOnly?: boolean;
  setInStockOnly?: (inStock: boolean) => void;
}

export default function Navbar({
  onCartClick,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCartContext();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [addressLabel, setAddressLabel] = useState(() => localStorage.getItem("address_label") || "Select Location");
  const [addressValue, setAddressValue] = useState(() => localStorage.getItem("user_address") || "Choose delivery address");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempLabel, setTempLabel] = useState("Work");
  const [customLabel, setCustomLabel] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  const [tempAddressLine1, setTempAddressLine1] = useState("");
  const [tempAddressLine2, setTempAddressLine2] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [tempPincode, setTempPincode] = useState("");

  const [addressSheetView, setAddressSheetView] = useState<'select' | 'add'>('select');
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem("saved_addresses");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const getFormattedAddress = (details: { addressLine1: string; addressLine2?: string; city: string; state: string; pincode: string }) => {
    return [
      details.addressLine1,
      details.addressLine2,
      details.city,
      details.state,
      details.pincode
    ].filter(Boolean).join(", ");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setAddressLabel(localStorage.getItem("address_label") || "Work");
      setAddressValue(localStorage.getItem("user_address") || "12 Bakery Lane, Sweet City");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (id: string) => {
    if (id === "products") {
      navigate("/products");
      return;
    }

    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate(`/#${id}`);
    }
  };

  const [bounce, setBounce] = useState(false);

  const [prevTotalItems, setPrevTotalItems] = useState(totalItems);
  if (totalItems !== prevTotalItems) {
    setPrevTotalItems(totalItems);
    if (totalItems > 0) {
      setBounce(true);
    }
  }

  useEffect(() => {
    if (bounce) {
      const timer = setTimeout(() => setBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [bounce]);

  return (
    <>
      {/* Desktop Floating Navbar */}
      <nav
        className={`hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
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
              placeholder="Search for supplies..."
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

            <Link
              to={user ? "/profile" : "/login"}
              className="group p-2 rounded-full hover:bg-espresso/5 transition-colors hidden sm:block"
            >
              <User className="w-6 h-6 text-espresso group-hover:text-burnt-orange transition-colors" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Swiggy-like Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 w-full bg-espresso text-white pb-3 pt-2.5 px-4 shadow-md flex flex-col gap-2">
        {/* Top Row: Location & Profile */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => {
              if (addressLabel === "Home" || addressLabel === "Work") {
                setTempLabel(addressLabel);
                setCustomLabel("");
              } else if (addressLabel === "Select Location" || !addressLabel) {
                setTempLabel("Home");
                setCustomLabel("");
              } else {
                setTempLabel("Other");
                setCustomLabel(addressLabel);
              }
              try {
                const saved = localStorage.getItem("user_address_details");
                if (saved && localStorage.getItem("user_address") !== "Choose delivery address") {
                  const parsed = JSON.parse(saved);
                  setTempAddressLine1(parsed.addressLine1 || "");
                  setTempAddressLine2(parsed.addressLine2 || "");
                  setTempCity(parsed.city || "");
                  setTempState(parsed.state || "");
                  setTempPincode(parsed.pincode || "");
                } else {
                  setTempAddressLine1("");
                  setTempAddressLine2("");
                  setTempCity("");
                  setTempState("");
                  setTempPincode("");
                }
              } catch {
                setTempAddressLine1("");
                setTempAddressLine2("");
                setTempCity("");
                setTempState("");
                setTempPincode("");
              }
              setIsAddressModalOpen(true);
            }}
            className="flex items-center gap-2 max-w-[80%] cursor-pointer hover:opacity-90 active:scale-98 transition-all"
          >
            <MapPin className="w-4 h-4 text-burnt-orange shrink-0 animate-pulse" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs tracking-tight">{addressLabel}</span>
                <span className="text-[8px] text-white/60">▼</span>
              </div>
              <span className="text-[9px] text-white/70 truncate">
                {addressValue}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to={user ? "/profile" : "/login"} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/25">
              <User className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>

        {/* Middle Row: Search */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for supplies..."
              className="navbar-search-input w-full bg-white text-espresso rounded-full py-2 pl-10 pr-4 text-xs font-medium border border-espresso/15 focus:border-burnt-orange outline-none h-9 shadow-sm"
            />
          </div>
        </div>
      </div>
      {/* Mobile Header Spacer */}
      <div className="md:hidden h-[86px]" />

      {/* Address Edit Bottom Sheet */}
      {isAddressModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm transition-all"
          onClick={() => { setIsAddressModalOpen(false); setAddressSheetView('select'); }}
        >
          <div 
            className="w-full max-w-md bg-[#F4F3F6] rounded-t-[30px] p-6 shadow-xl flex flex-col gap-4 overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "85vh",
              boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.12)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-espresso/15 rounded-full mx-auto mb-1 shrink-0" />
            
            {/* SELECT VIEW */}
            {addressSheetView === 'select' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsAddressModalOpen(false)}
                      className="p-1 rounded-full hover:bg-espresso/5 text-espresso"
                    >
                      <ArrowLeft className="w-5 h-5 text-espresso" />
                    </button>
                    <h3 className="font-heading text-lg font-bold text-espresso">Select Your Location</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddressModalOpen(false)}
                    className="text-espresso hover:text-burnt-orange font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative shrink-0">
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder="Search an area or address"
                    className="w-full bg-white border border-espresso/10 rounded-2xl py-3.5 pl-4 pr-10 text-xs font-semibold text-espresso placeholder:text-taupe/40 focus:border-burnt-orange outline-none transition-all shadow-sm"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" />
                </div>

                {/* Horizontal Action Cards */}
                <div className="grid grid-cols-2 gap-3 my-2 shrink-0">
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const mockAddr = {
                            id: "addr-current",
                            label: "Location",
                            addressLine1: `Lat: ${position.coords.latitude.toFixed(4)}`,
                            addressLine2: `Lon: ${position.coords.longitude.toFixed(4)}`,
                            city: "Sweet City",
                            state: "Kerala",
                            pincode: "695013"
                          };
                          const formatted = getFormattedAddress(mockAddr);
                          setAddressLabel("Location");
                          setAddressValue(formatted);
                          localStorage.setItem("address_label", "Location");
                          localStorage.setItem("user_address", formatted);
                          localStorage.setItem("user_address_details", JSON.stringify(mockAddr));
                          window.dispatchEvent(new Event("storage"));
                          setIsAddressModalOpen(false);
                        }, () => {
                          alert("Could not access your location. Please enter manually.");
                        });
                      }
                    }}
                    className="bg-white rounded-[20px] border border-espresso/5 p-3 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:scale-[1.02] active:scale-98 transition-all h-[105px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Compass className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-espresso leading-tight">Use Current Location</span>
                  </button>

                  <button
                    onClick={() => setAddressSheetView('add')}
                    className="bg-white rounded-[20px] border border-espresso/5 p-3 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:scale-[1.02] active:scale-98 transition-all h-[105px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Plus className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] font-bold text-espresso leading-tight">Add New Address</span>
                  </button>
                </div>

                {/* Saved Addresses Section */}
                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[10px] font-bold text-taupe uppercase tracking-wider block pl-1">Saved Addresses</span>
                  <div className="bg-white rounded-[24px] border border-espresso/5 shadow-sm p-1.5 flex flex-col">
                    {savedAddresses.filter(addr => getFormattedAddress(addr).toLowerCase().includes(locationSearchQuery.toLowerCase()) || addr.label.toLowerCase().includes(locationSearchQuery.toLowerCase())).length === 0 ? (
                      <div className="text-center py-6 text-xs text-taupe/65 font-medium">
                        No saved addresses found.
                      </div>
                    ) : (
                      savedAddresses
                        .filter(addr => getFormattedAddress(addr).toLowerCase().includes(locationSearchQuery.toLowerCase()) || addr.label.toLowerCase().includes(locationSearchQuery.toLowerCase()))
                        .map((addr) => {
                          const formatted = getFormattedAddress(addr);
                          const isSelected = addressLabel === addr.label && addressValue === formatted;
                          const isHome = addr.label.toLowerCase() === 'home';
                          const Icon = isHome ? Home : Navigation;
                          return (
                            <div 
                              key={addr.id}
                              onClick={() => {
                                setAddressLabel(addr.label);
                                setAddressValue(formatted);
                                localStorage.setItem("address_label", addr.label);
                                localStorage.setItem("user_address", formatted);
                                localStorage.setItem("user_address_details", JSON.stringify(addr));
                                window.dispatchEvent(new Event("storage"));
                                setIsAddressModalOpen(false);
                              }}
                              className="flex items-center gap-3.5 py-3.5 px-3 border-b border-espresso/5 last:border-b-0 cursor-pointer hover:bg-espresso/5 transition-colors rounded-[18px]"
                            >
                              <div className="w-9 h-9 rounded-xl bg-espresso/5 flex items-center justify-center text-espresso shrink-0">
                                <Icon className="w-4.5 h-4.5 text-espresso/80" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-espresso leading-tight">{addr.label}</span>
                                  {isSelected && (
                                    <span className="bg-[#E2F6EC] text-[#22C55E] text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                      SELECTED
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-taupe mt-1 truncate leading-normal">
                                  {formatted}
                                </p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove address "${addr.label}"?`)) {
                                    const updated = savedAddresses.filter(a => a.id !== addr.id);
                                    setSavedAddresses(updated);
                                    localStorage.setItem("saved_addresses", JSON.stringify(updated));
                                  }
                                }}
                                className="p-1 rounded-full hover:bg-espresso/5 text-taupe hover:text-espresso shrink-0"
                              >
                                <MoreVertical className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                  
                  {/* View All */}
                  <button className="py-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 mt-1 shrink-0">
                    View all <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              /* ADD NEW ADDRESS VIEW */
              <>
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setAddressSheetView('select')}
                      className="p-1 rounded-full hover:bg-espresso/5 text-espresso"
                    >
                      <ArrowLeft className="w-5 h-5 text-espresso" />
                    </button>
                    <h3 className="font-heading text-lg font-bold text-espresso">Select Delivery Address</h3>
                  </div>
                  <button 
                    onClick={() => { setIsAddressModalOpen(false); setAddressSheetView('select'); }}
                    className="text-espresso hover:text-burnt-orange font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>

                {/* Address Inputs */}
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-[10px] font-bold text-taupe uppercase tracking-wider block mb-1">Address Line 1 *</label>
                    <div className="relative">
                      <Building size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={tempAddressLine1}
                        onChange={(e) => setTempAddressLine1(e.target.value)}
                        placeholder="Flat / House no., Building, Apartment"
                        className="w-full bg-[#FAFAFA] border border-espresso/15 rounded-xl px-3 py-2.5 text-sm text-espresso placeholder:text-taupe/50 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange/20 outline-none transition-all input-with-icon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-taupe uppercase tracking-wider block mb-1">Address Line 2 (optional)</label>
                    <div className="relative">
                      <MapPin size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={tempAddressLine2}
                        onChange={(e) => setTempAddressLine2(e.target.value)}
                        placeholder="Street, Sector, Area, Landmark"
                        className="w-full bg-[#FAFAFA] border border-espresso/15 rounded-xl px-3 py-2.5 text-sm text-espresso placeholder:text-taupe/50 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange/20 outline-none transition-all input-with-icon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-taupe uppercase tracking-wider block mb-1">State *</label>
                      <button
                        type="button"
                        onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                        className="w-full bg-[#FAFAFA] outline-none transition-all flex items-center justify-between text-left text-sm text-espresso"
                        style={{
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                          borderColor: 'rgba(61, 43, 31, 0.18)',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          height: 'auto',
                          borderRadius: '0.75rem',
                          position: 'relative'
                        }}
                      >
                        <Compass size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <span className={tempState ? "text-espresso font-medium truncate" : "text-taupe/50"}>
                          {tempState || "Select"}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-taupe shrink-0 ml-1 transition-transform ${isStateDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isStateDropdownOpen && (
                        <div 
                          className="absolute left-0 right-0 bg-white border border-espresso/10 rounded-xl shadow-2xl z-50 overflow-y-auto no-scrollbar top-[calc(100%+4px)]"
                          style={{ maxHeight: "200px", scrollbarWidth: "none" }}
                        >
                          {INDIAN_STATES.map((stateName) => (
                            <button
                              key={stateName}
                              type="button"
                              onClick={() => {
                                setTempState(stateName);
                                setIsStateDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-medium transition-colors border-b border-espresso/5 last:border-b-0"
                              style={{
                                backgroundColor: tempState === stateName ? "#FEF2EB" : "white",
                                color: tempState === stateName ? "#D95B35" : "#3D2B1F",
                              }}
                            >
                              {stateName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-taupe uppercase tracking-wider block mb-1">City *</label>
                      <div className="relative">
                        <Home size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={tempCity}
                          onChange={(e) => setTempCity(e.target.value)}
                          placeholder="Enter City"
                          className="w-full bg-[#FAFAFA] border border-espresso/15 rounded-xl px-3 text-sm text-espresso placeholder:text-taupe/50 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange/20 outline-none transition-all input-with-icon"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-taupe uppercase tracking-wider block mb-1">Pincode *</label>
                    <div className="relative">
                      <Hash size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={tempPincode}
                        onChange={(e) => setTempPincode(e.target.value)}
                        placeholder="6-digit pincode"
                        className="w-full bg-[#FAFAFA] border border-espresso/15 rounded-xl px-3 py-2.5 text-sm text-espresso placeholder:text-taupe/50 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange/20 outline-none transition-all input-with-icon"
                      />
                    </div>
                  </div>
                </div>

                 {/* Address Label Selector */}
                 <div className="space-y-3 shrink-0 border-t border-espresso/10 pt-3">
                   <span className="text-[10px] font-bold text-taupe uppercase tracking-wider block">Save address as</span>
                   <div className="flex gap-2">
                     {["Home", "Work", "Other"].map((label) => {
                       const isSelected = tempLabel === label;
                       const IconComponent = label === "Home" ? Home : label === "Work" ? Briefcase : Tag;
                       return (
                         <button
                           key={label}
                           onClick={() => {
                             setTempLabel(label);
                             if (label !== "Other") {
                               setCustomLabel("");
                             }
                           }}
                           type="button"
                           className="flex items-center gap-1.5 border text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] outline-none"
                           style={{
                             borderColor: isSelected ? "#D95B35" : "rgba(61, 43, 31, 0.12)",
                             backgroundColor: isSelected ? "#D95B35" : "white",
                             color: isSelected ? "white" : "#3D2B1F",
                             padding: '0.5rem 1rem',
                             borderRadius: '9999px',
                           }}
                         >
                           <IconComponent size={14} className={isSelected ? "text-white" : "text-taupe/80"} />
                           {label}
                         </button>
                       );
                     })}
                   </div>
                   
                   {tempLabel === "Other" && (
                     <div className="mt-2 relative">
                       <Tag size={16} className="text-taupe/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                       <input
                         type="text"
                         value={customLabel}
                         onChange={(e) => setCustomLabel(e.target.value)}
                         placeholder="Name this address (e.g. Gym, Friend's house)"
                         className="w-full bg-[#FAFAFA] border border-espresso/15 rounded-xl px-3 py-2.5 text-sm text-espresso placeholder:text-taupe/50 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange/20 outline-none transition-all input-with-icon"
                       />
                     </div>
                   )}
                 </div>

                {/* Save Button */}
                <button
                  onClick={() => {
                    if (!tempAddressLine1.trim() || !tempCity.trim() || !tempState.trim() || !tempPincode.trim()) return;
                    const finalLabel = tempLabel === "Other" && customLabel.trim() !== "" ? customLabel.trim() : tempLabel;
                    const newDetails = {
                      id: "addr-" + Date.now(),
                      label: finalLabel,
                      addressLine1: tempAddressLine1.trim(),
                      addressLine2: tempAddressLine2.trim(),
                      city: tempCity.trim(),
                      state: tempState.trim(),
                      pincode: tempPincode.trim()
                    };
                    const formatted = getFormattedAddress(newDetails);
                    
                    const updated = [newDetails, ...savedAddresses.filter(a => a.label !== finalLabel)];
                    setSavedAddresses(updated);
                    localStorage.setItem("saved_addresses", JSON.stringify(updated));

                    setAddressLabel(finalLabel);
                    setAddressValue(formatted);
                    localStorage.setItem("address_label", finalLabel);
                    localStorage.setItem("user_address", formatted);
                    localStorage.setItem("user_address_details", JSON.stringify(newDetails));
                    window.dispatchEvent(new Event("storage"));
                    
                    setIsStateDropdownOpen(false);
                    setAddressSheetView('select');
                    setIsAddressModalOpen(false);
                  }}
                  disabled={!tempAddressLine1.trim() || !tempCity.trim() || !tempState.trim() || !tempPincode.trim() || (tempLabel === "Other" && !customLabel.trim())}
                  className="w-full py-2.5 font-bold rounded-xl text-sm transition-all text-center shrink-0 flex items-center justify-center shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    backgroundColor: (!tempAddressLine1.trim() || !tempCity.trim() || !tempState.trim() || !tempPincode.trim() || (tempLabel === "Other" && !customLabel.trim()))
                      ? "#E8D5C4" : "#D95B35",
                    color: (!tempAddressLine1.trim() || !tempCity.trim() || !tempState.trim() || !tempPincode.trim() || (tempLabel === "Other" && !customLabel.trim()))
                      ? "#A08979" : "#FFFFFF",
                    boxShadow: "0 4px 14px rgba(217, 91, 53, 0.2)",
                  }}
                >
                  Save Address
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
