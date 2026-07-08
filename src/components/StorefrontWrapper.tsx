import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Loader2, Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AdminPortal from "@/pages/AdminPortal";

export default function StorefrontWrapper() {
  const { initialize, isLoading, isInitialized, user } = useAuthStore();
  const { isCartOpen, setIsCartOpen, totalItems } = useCartContext();
  const [showPortalModal, setShowPortalModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading || !isInitialized) return;

    // Show store selector popup once per session for all users
    const isShown = sessionStorage.getItem("store_selector_shown");
    if (isShown !== "true") {
      setShowPortalModal(true);
    }
  }, [isLoading, isInitialized]);

  const handleClosePortalModal = () => {
    setShowPortalModal(false);
    sessionStorage.setItem("store_selector_shown", "true");
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const isHomeActive = location.pathname === "/";
  const isShopActive = location.pathname === "/products";
  const isProfileActive = location.pathname === "/profile" || location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-espresso/10 flex justify-around items-center py-2.5 shadow-[0_-4px_12px_rgba(61,43,31,0.06)] rounded-t-[20px]">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${isHomeActive ? "text-burnt-orange scale-105" : "text-taupe"
            }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </Link>

        <Link
          to="/products"
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${isShopActive ? "text-burnt-orange scale-105" : "text-taupe"
            }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Shop</span>
        </Link>

        <button
          onClick={handleCartClick}
          className={`relative flex flex-col items-center justify-center w-16 py-1 transition-all text-taupe hover:text-burnt-orange`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-burnt-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight font-body">Cart</span>
        </button>

        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${isProfileActive ? "text-burnt-orange scale-105" : "text-taupe"
            }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">Profile</span>
        </Link>
      </div>

      {/* Global Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Store Selector / Admin Portal Modal on First Load */}
      {showPortalModal && (
        <AdminPortal isModal={true} onClose={handleClosePortalModal} isCustomerMode={true} />
      )}
    </div>
  );
}
