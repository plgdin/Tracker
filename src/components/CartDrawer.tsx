import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import { useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCartContext();
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [offerCode, setOfferCode] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{
    whatsappUrl: string;
  } | null>(null);

  const handleCheckout = () => {
    if (!customerName || !customerPhone) return;

    let text = `*New Order - Bake & Joy*\n\n`;
    text += `*Customer:* ${customerName}\n`;
    text += `*Phone:* ${customerPhone}\n`;
    if (customerEmail) text += `*Email:* ${customerEmail}\n`;
    text += `*Delivery Type:* ${deliveryType}\n`;
    if (deliveryType === "delivery") text += `*Address:* ${address}\n`;
    if (notes) text += `*Notes:* ${notes}\n`;
    if (offerCode) text += `*Offer Code:* ${offerCode}\n`;
    text += `\n*Items:*\n`;
    items.forEach((item) => {
      text += `- ${item.name} x${item.quantity} (Rs.${Number(item.price) * item.quantity})\n`;
    });
    text += `\n*Total Amount: Rs.${totalAmount}*\n`;
    text += `\nPlease confirm my order and share payment QR.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/919876543210?text=${encodedText}`;

    setOrderSuccess({
      whatsappUrl,
    });
    clearCart();
  };

  if (orderSuccess) {
    return (
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-espresso mb-2">
            Order Placed!
          </h2>
          <p className="text-taupe mb-6">
            Your order details are ready. Click below to send it via WhatsApp to our store.
          </p>
          <a
            href={orderSuccess.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            Send via WhatsApp
            <ArrowRight className="w-5 h-5" />
          </a>
          <button
            onClick={() => {
              setOrderSuccess(null);
              setShowCheckout(false);
              onClose();
            }}
            className="mt-4 text-taupe hover:text-espresso transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-espresso/10">
          <h2 className="font-heading text-xl font-bold text-espresso">
            {showCheckout ? "Checkout" : "Your Cart"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-espresso/5 transition-colors"
          >
            <X className="w-5 h-5 text-espresso" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 && !showCheckout ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <ShoppingBag className="w-16 h-16 text-taupe/40 mb-4" />
              <p className="text-taupe text-lg">Your cart is empty</p>
              <p className="text-taupe/60 text-sm mt-1">
                Add some delicious items!
              </p>
            </div>
          ) : showCheckout ? (
            /* Checkout Form */
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all"
                  placeholder="+91-9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-2">
                  Delivery Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                      deliveryType === "pickup"
                        ? "border-burnt-orange bg-burnt-orange/5 text-burnt-orange"
                        : "border-espresso/15 text-espresso/70"
                    }`}
                  >
                    Store Pickup
                  </button>
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                      deliveryType === "delivery"
                        ? "border-burnt-orange bg-burnt-orange/5 text-burnt-orange"
                        : "border-espresso/15 text-espresso/70"
                    }`}
                  >
                    Home Delivery
                  </button>
                </div>
              </div>
              {deliveryType === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-espresso mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Enter your delivery address"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="Any special instructions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Offer Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all uppercase"
                    placeholder="e.g. FIRST15"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-sm text-taupe hover:text-espresso transition-colors"
              >
                ← Back to cart
              </button>
            </div>
          ) : (
            /* Cart Items */
            <div className="p-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 bg-cream/50 rounded-2xl p-3"
                >
                  <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-taupe/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-espresso text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-burnt-orange font-semibold text-sm mt-1">
                      Rs.{item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full bg-white border border-espresso/15 flex items-center justify-center hover:bg-espresso/5 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full bg-white border border-espresso/15 flex items-center justify-center hover:bg-espresso/5 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-taupe hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !showCheckout && (
          <div className="border-t border-espresso/10 p-5 space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-taupe">Subtotal</span>
              <span className="font-heading text-xl font-bold text-espresso">
                Rs.{totalAmount}
              </span>
            </div>
            <p className="text-xs text-taupe">
              Payment via QR code after order confirmation
            </p>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 bg-burnt-orange text-white font-semibold rounded-full hover:bg-[#C44D2A] transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {showCheckout && (
          <div className="border-t border-espresso/10 p-5 space-y-4 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-taupe">Total</span>
              <span className="font-heading text-xl font-bold text-espresso">
                Rs.{totalAmount}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!customerName || !customerPhone}
              className="w-full py-4 bg-burnt-orange text-white font-semibold rounded-full hover:bg-[#C44D2A] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Place Order via WhatsApp
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
