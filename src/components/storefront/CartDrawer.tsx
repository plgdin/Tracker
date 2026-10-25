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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#361B0E]/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E8D8CC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8D8CC] flex items-center justify-between bg-[#F9F4EE]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F2E7DC] flex items-center justify-center text-[#4A2818]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#4A2818] leading-tight">
                  Your Baking Basket
                </h2>
                <p className="text-xs text-[#7A6153] font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center border border-[#E8D8CC] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body: Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F2E7DC] flex items-center justify-center text-[#4A2818]">
                  <PackageOpen className="w-8 h-8 stroke-[1.8]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#4A2818]">
                  Your basket is empty
                </h3>
                <p className="text-xs text-[#7A6153] max-w-xs leading-relaxed font-normal">
                  Explore our couverture chocolate, silicone moulds, and cake toppers to start baking.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#4A2818] text-[#F9F4EE] text-xs font-medium hover:bg-[#361B0E] transition-all shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E8D8CC]/50">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedVariant || ''}`} className="py-3.5 first:pt-0 last:pb-0 flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-2xl border border-[#E8D8CC] bg-[#F9F4EE] shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A2818] truncate">
                            {item.name}
                          </h4>
                          <span className="font-serif font-bold text-xs text-[#4A2818] shrink-0">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                        {item.selectedVariant && (
                          <div className="text-[10px] text-[#7A6153] font-medium">
                            Size: {item.selectedVariant}
                          </div>
                        )}
                        <div className="text-[10px] text-[#7A6153]/70">
                          ₹{item.price} each
                        </div>
                      </div>

                      {/* Quantity & Remove Row */}
                      <div className="flex items-center justify-between pt-1.5">
                        <div className="flex items-center border border-[#E8D8CC] rounded-full p-0.5 bg-white">
                          <button
                            onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center font-serif font-bold text-xs text-[#4A2818]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.selectedVariant, item.quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.selectedVariant)}
                          className="text-[11px] font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer with Totals & Checkout */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-[#F9F4EE] border-t border-[#E8D8CC] space-y-4">
              
              {/* Counter Pickup Alert */}
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#E8D8CC] text-[11px] text-[#4A2818]">
                <MapPin className="w-4 h-4 text-[#4A2818] shrink-0" />
                <span>
                  <strong>Counter Pickup:</strong> Collect at Trivandrum Main Market Road with zero delivery fee.
                </span>
              </div>

              {/* Subtotal & Total */}
              <div className="space-y-1.5 text-xs text-[#7A6153]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-bold text-[#4A2818]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Store Packing</span>
                  <span className="font-semibold text-[#4A2818]">FREE</span>
                </div>
                <div className="pt-2 border-t border-[#E8D8CC] flex justify-between items-baseline">
                  <span className="font-serif font-bold text-sm text-[#4A2818]">Total Amount</span>
                  <span className="font-serif font-bold text-xl text-[#4A2818]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <span>Proceed to Pickup Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-medium text-[#7A6153] hover:text-[#4A2818] transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
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
