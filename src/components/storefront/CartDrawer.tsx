import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  PackageOpen
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    totalAmount, 
    isCartOpen, 
    setIsCartOpen,
    setIsCheckoutOpen
  } = useCartContext();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-[#351E28] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[#351E28]/10 flex items-center justify-between bg-[#F8F7F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#351E28] flex items-center justify-center text-[#EAF05C]">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-[#351E28] leading-tight">
                  Your Baking Basket
                </h2>
                <p className="text-xs text-[#351E28]/60 font-semibold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#351E28] hover:text-[#EAF05C] text-[#351E28] flex items-center justify-center border border-[#351E28]/15 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-[#351E28]/5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[#D7EFFF] border-2 border-[#351E28] flex items-center justify-center text-[#351E28] shadow-pop-sm">
                  <PackageOpen className="w-10 h-10 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-black text-[#351E28] mb-1">
                    Your basket is empty
                  </h3>
                  <p className="text-xs text-[#351E28]/60 max-w-xs leading-relaxed">
                    Explore our cake decor, couverture chocolate, moulds, and essentials to start baking!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#FF5C34] hover:bg-[#e44c26] text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md"
                >
                  Start Browsing Supplies
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={`${item.productId}-${item.selectedVariant || idx}`} className="flex items-center gap-3.5 pt-3 first:pt-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#F8F7F0] border border-[#351E28]/10 shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-black text-xs sm:text-sm text-[#351E28] truncate mb-0.5">
                        {item.name}
                      </h4>
                      {item.selectedVariant && (
                        <div className="text-[10px] font-bold text-[#AEBBA0] uppercase tracking-wider mb-1">
                          Option: {item.selectedVariant}
                        </div>
                      )}
                      <div className="font-heading font-black text-xs text-[#FF5C34]">
                        ₹{item.price} each
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center border border-[#351E28]/20 rounded-full p-0.5 bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F8F7F0] text-[#351E28] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-[#351E28]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F8F7F0] text-[#351E28] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.selectedVariant)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer with Totals & Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-[#F8F7F0] border-t border-[#351E28]/10 space-y-4">
              
              {/* Counter Pickup Alert */}
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#351E28]/10 text-[11px] text-[#351E28]">
                <MapPin className="w-4 h-4 text-[#FF5C34] shrink-0" />
                <span>
                  <strong>Counter Pickup:</strong> Collect at Bangalore Main Market Road with zero delivery fee.
                </span>
              </div>

              {/* Subtotal & Total */}
              <div className="space-y-1.5 text-xs text-[#351E28]/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#351E28]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Store Counter Packing</span>
                  <span className="font-bold text-[#AEBBA0]">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#351E28]/10 flex justify-between items-baseline">
                  <span className="font-heading font-black text-sm text-[#351E28]">Total Amount</span>
                  <span className="font-heading font-black text-xl text-[#351E28]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C34]/25 transition-all active:scale-95"
                >
                  <span>Proceed to Pickup Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-bold text-[#351E28]/70 hover:text-[#351E28] transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
