import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
import { useToastStore } from '../../store/toastStore';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    addItem,
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    totalAmount, 
    isCartOpen, 
    setIsCartOpen,
    setIsCheckoutOpen
  } = useCartContext();

  const { showToast } = useToastStore();
  const shouldReduceMotion = useReducedMotion();

  const handleRemoveItem = (item: (typeof items)[0]) => {
    removeItem(item.productId, item.selectedVariant);
    showToast(
      `Removed "${item.name}" from cart`,
      {
        label: 'Undo',
        onClick: () => {
          addItem(item, item.quantity);
        },
      },
      6000
    );
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Spring physics for interruptible Apple-style gestures
  const springTransition = shouldReduceMotion
    ? { duration: 0.15 }
    : { type: 'spring' as const, damping: 30, stiffness: 340, mass: 0.8 };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dim Backdrop with Interruptible Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.05 : 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#361B0E]/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Sheet / Drawer Container */}
          <div className="fixed inset-0 pointer-events-none flex flex-col justify-end sm:justify-start sm:flex-row sm:items-stretch sm:justify-end">
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.04, bottom: 0.6 }}
              onDragEnd={(_e, info) => {
                // Swipe-to-dismiss: closes on distance (> 100px) or quick flick downwards (> 400px/s)
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  setIsCartOpen(false);
                }
              }}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: '100%', opacity: 1 }
              }
              animate={{ y: 0, opacity: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: '100%', opacity: 0.95 }
              }
              transition={springTransition}
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Cart Drawer"
              className="pointer-events-auto w-full sm:max-w-md bg-white border-t sm:border-t-0 sm:border-l border-[#E8D8CC] rounded-t-[2.2rem] sm:rounded-t-none shadow-2xl flex flex-col justify-between max-h-[90vh] sm:max-h-full sm:h-full overflow-hidden"
            >
              {/* Apple-style Drag Handle Indicator for touch dismissal on mobile */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-[#E8D8CC]" />
              </div>

              {/* Drawer Header with Close Button */}
              <div className="p-4 sm:p-6 border-b border-[#E8D8CC] flex items-center justify-between bg-[#F9F4EE]">
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
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center border border-[#E8D8CC] transition-colors hit-slop-44"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body: Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
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
                      type="button"
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
                          className="w-16 h-16 rounded-2xl object-cover border border-[#E8D8CC]/80 shrink-0 bg-[#F9F4EE]"
                        />

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif font-bold text-sm text-[#4A2818] leading-snug line-clamp-2">
                                {item.name}
                              </h3>
                              <span className="font-serif font-bold text-sm text-[#4A2818] shrink-0 tabular-nums">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>

                            {item.selectedVariant && (
                              <div className="text-[11px] font-medium text-[#7A6153] mt-0.5">
                                Variant: <span className="text-[#4A2818]">{item.selectedVariant}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-[#7A6153]/70 tabular-nums">
                              ₹{item.price} each
                            </div>
                          </div>

                          {/* Quantity & Remove Row */}
                          <div className="flex items-center justify-between pt-1.5">
                            <div className="flex items-center border border-[#E8D8CC] rounded-full p-0.5 bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] transition-colors hit-slop-44"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-6 text-center font-serif font-bold text-xs text-[#4A2818] tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] transition-colors hit-slop-44"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              className="text-[11px] font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors hit-slop-44"
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
                <div className="p-4 sm:p-6 bg-[#F9F4EE] border-t border-[#E8D8CC] space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                      <span className="font-serif font-bold text-[#4A2818] tabular-nums">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Store Packing</span>
                      <span className="font-semibold text-[#4A2818]">FREE</span>
                    </div>
                    <div className="pt-2 border-t border-[#E8D8CC] flex justify-between items-baseline">
                      <span className="font-serif font-bold text-sm text-[#4A2818]">Total Amount</span>
                      <span className="font-serif font-bold text-xl text-[#4A2818] tabular-nums">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full py-3.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      <span>Proceed to Pickup Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-medium text-[#7A6153] hover:text-[#4A2818] transition-colors"
                      >
                        Continue Shopping
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
