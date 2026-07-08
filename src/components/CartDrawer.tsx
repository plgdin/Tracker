import { X, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, ChevronDown } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalAmount, totalGst, clearCart } = useCartContext();
  const { user } = useAuthStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setShowCheckout(false);
    }
  }

  const handleRemoveClick = (productId: string) => {
    setRemovingIds((prev) => [...prev, productId]);
    setTimeout(() => {
      removeItem(productId);
      setRemovingIds((prev) => prev.filter((id) => id !== productId));
    }, 300);
  };
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [offerCode, setOfferCode] = useState("");

  const formattedAddress = [
    addressLine1.trim(),
    addressLine2.trim(),
    city.trim(),
    state.trim(),
    pincode.trim()
  ].filter(Boolean).join(", ");

  const isAddressValid = deliveryType === "pickup" || (
    addressLine1.trim() !== "" &&
    city.trim() !== "" &&
    state.trim() !== "" &&
    pincode.trim() !== ""
  );

  const canPlaceOrder = customerName.trim() !== "" && customerPhone.trim() !== "" && isAddressValid;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        try {
          const saved = localStorage.getItem("user_address_details");
          if (saved) {
            const parsed = JSON.parse(saved);
            setAddressLine1(parsed.addressLine1 || "");
            setAddressLine2(parsed.addressLine2 || "");
            setCity(parsed.city || "");
            setState(parsed.state || "");
            setPincode(parsed.pincode || "");
            return;
          }
        } catch { /* ignore */ }

        const legacy = localStorage.getItem("user_address") || "";
        if (legacy) {
          const parts = legacy.split(",").map((p) => p.trim());
          setAddressLine1(parts[0] || "");
          setAddressLine2(parts.length > 2 ? parts.slice(1, -1).join(", ") : parts[1] || "");
          setCity(parts[parts.length - 1] || "");
          setState("");
          setPincode("");
        }
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (addressLine1 || city || state || pincode) {
      const details = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };
      localStorage.setItem("user_address_details", JSON.stringify(details));
      localStorage.setItem("user_address", formattedAddress);
      window.dispatchEvent(new Event("storage"));
    }
  }, [addressLine1, addressLine2, city, state, pincode, formattedAddress]);

  const [orderSuccess, setOrderSuccess] = useState<{
    whatsappUrl: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!canPlaceOrder) return;
    setIsSubmitting(true);

    try {
      const orderId = await db.generateOrderId();
      const receiptItems = items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        gstPercentage: item.gstPercentage || 0
      }));

      // Save order to database
      await db.addOnlineOrder({
        id: orderId,
        user_id: user?.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        delivery_type: deliveryType,
        address: deliveryType === "delivery" ? formattedAddress : "Store Pickup",
        notes: notes || undefined,
        offer_code: offerCode || undefined,
        total_amount: Number(totalAmount),
        items: receiptItems,
      });

      let text = `*New Order - Chef & Joy*\n\n`;
      text += `*Order ID:* ${orderId}\n`;
      text += `*Customer:* ${customerName}\n`;
      text += `*Phone:* ${customerPhone}\n`;
      if (customerEmail) text += `*Email:* ${customerEmail}\n`;
      text += `*Delivery Type:* ${deliveryType}\n`;
      if (deliveryType === "delivery") text += `*Address:* ${formattedAddress}\n`;
      if (notes) text += `*Notes:* ${notes}\n`;
      if (offerCode) text += `*Offer Code:* ${offerCode}\n`;
      text += `\n*Items:*\n`;
      items.forEach((item) => {
        text += `- ${item.name} x${item.quantity} (Rs.${Number(item.price) * item.quantity})\n`;
      });
      text += `\n*Total Amount: Rs.${totalAmount}*\n`;

      const itemsParam = encodeURIComponent(JSON.stringify(receiptItems));
      const phoneParam = encodeURIComponent(customerPhone);
      const emailParam = encodeURIComponent(customerEmail || '');
      const deliveryParam = encodeURIComponent(deliveryType);
      const addressParam = encodeURIComponent(deliveryType === "delivery" ? formattedAddress : "Store Pickup");
      const notesParam = encodeURIComponent(notes || '');

      const receiptUrl = `${window.location.origin}/receipt?order=${orderId}&amount=${totalAmount}&name=${encodeURIComponent(customerName)}&phone=${phoneParam}&email=${emailParam}&delivery=${deliveryParam}&address=${addressParam}&notes=${notesParam}&items=${itemsParam}`;

      text += `\nPlease confirm my order and share payment QR.`;
      text += `\n\n*View Receipt & Payment QR:*\n${receiptUrl}`;

      const encodedText = encodeURIComponent(text);
      const settings = await db.getStoreSettings();
      const phoneNumber = settings.phone_number || import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

      setOrderSuccess({
        whatsappUrl,
      });
      clearCart();
    } catch (e) {
      console.error("Failed to place order", e);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
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
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        {showCheckout ? (
          <div className="relative flex items-center justify-center py-6 px-5 border-b border-espresso/10">
            {items.length > 0 && (
              <button
                onClick={() => setShowCheckout(false)}
                className="absolute left-5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-espresso/5 transition-colors"
                aria-label="Back to cart"
              >
                <ArrowLeft className="w-6 h-6 text-espresso" />
              </button>
            )}
            <h2 className="font-heading text-[24px] font-bold text-espresso text-center leading-tight">
              Checkout
            </h2>
            <button
              onClick={onClose}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-espresso/5 transition-colors"
            >
              <X className="w-6 h-6 text-espresso" />
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center py-6 px-5 border-b border-espresso/10">
            <h2 className="font-heading text-[24px] font-bold text-espresso text-center leading-tight">
              Your Cart
            </h2>
            <button
              onClick={onClose}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-espresso/5 transition-colors"
            >
              <X className="w-6 h-6 text-espresso" />
            </button>
          </div>
        )}

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
            <div className="p-7 space-y-7">
              <div>
                <label className="block text-base font-semibold text-espresso mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-5 py-6 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-espresso mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-5 py-6 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                  placeholder="+91-1234567890"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-espresso mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-5 py-6 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-espresso mb-3">
                  Delivery Type
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`delivery-btn flex-1 py-5 rounded-xl transition-all text-base font-bold ${deliveryType === "pickup" ? "active" : "inactive"
                      }`}
                  >
                    Store Pickup
                  </button>
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`delivery-btn flex-1 py-5 rounded-xl transition-all text-base font-bold ${deliveryType === "delivery" ? "active" : "inactive"
                      }`}
                  >
                    Home Delivery
                  </button>
                </div>
              </div>
              {deliveryType === "delivery" && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-espresso border-b border-espresso/10 pb-2">Delivery Address</h4>

                  <div>
                    <label className="block text-sm font-semibold text-espresso mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                      placeholder="Flat / House no., Building, Apartment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-espresso mb-1">
                      Address Line 2 (optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                      placeholder="Street, Sector, Area, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {isStateDropdownOpen ? (
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-espresso">Select State</span>
                          <button
                            type="button"
                            onClick={() => setIsStateDropdownOpen(false)}
                            className="text-taupe hover:text-espresso text-sm font-bold"
                          >
                            Close
                          </button>
                        </div>
                        <div
                          className="rounded-xl border border-espresso/10 bg-white max-h-64 overflow-y-auto"
                          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                          {INDIAN_STATES.map((stateName) => (
                            <button
                              key={stateName}
                              type="button"
                              onClick={() => {
                                setState(stateName);
                                setIsStateDropdownOpen(false);
                              }}
                              className="w-full text-left px-5 py-3.5 text-base font-medium transition-colors border-b border-espresso/5 last:border-b-0"
                              style={{
                                backgroundColor: state === stateName ? "#FEF2EB" : "white",
                                color: state === stateName ? "#D95B35" : "#3D2B1F",
                              }}
                            >
                              {stateName}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-espresso mb-1">
                            State *
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsStateDropdownOpen(true)}
                            className="w-full px-5 py-4 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base bg-white h-[58px] flex items-center justify-between text-left"
                          >
                            <span className={state ? "text-espresso font-medium truncate" : "text-taupe/50"}>
                              {state || "Select State"}
                            </span>
                            <ChevronDown className="w-5 h-5 text-taupe shrink-0" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-espresso mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base h-[58px]"
                            placeholder="Enter City"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-espresso mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all text-base"
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-base font-semibold text-espresso mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-6 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all resize-none text-base"
                  rows={2}
                  placeholder="Any special instructions..."
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-espresso mb-2">
                  Offer Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    className="flex-1 px-5 py-6 rounded-xl border border-espresso/15 focus:border-burnt-orange focus:ring-2 focus:ring-burnt-orange/20 outline-none transition-all uppercase text-base"
                    placeholder="e.g. FIRST15"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4 overflow-x-hidden">
              {items.map((item) => {
                const isRemoving = removingIds.includes(item.productId);
                return (
                  <div
                    key={item.productId}
                    className={`flex gap-4 bg-cream/50 rounded-2xl p-3 transition-all duration-300 ${isRemoving ? "animate-fly-out-left" : ""
                      }`}
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
                        ₹{item.price}
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
                          onClick={() => handleRemoveClick(item.productId)}
                          className="ml-auto text-taupe hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !showCheckout && (
          <div className="border-t border-espresso/10 px-6 pt-6 pb-6 space-y-4 bg-cream text-espresso rounded-t-[32px] shadow-none">
            <div className="flex justify-between items-center px-2">
              <span className="text-espresso font-semibold text-sm">Subtotal</span>
              <span className="font-sans text-sm font-bold text-espresso">
                ₹{(Number(totalAmount) - Number(totalGst)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-espresso font-semibold text-sm">GST Taxes</span>
              <span className="font-sans text-sm font-bold text-espresso/70">
                ₹{totalGst}
              </span>
            </div>
            <div className="flex justify-between items-center px-2 pt-2 border-t border-espresso/10">
              <span className="text-espresso font-semibold text-lg">Grand Total</span>
              <span className="font-sans text-2xl font-bold text-burnt-orange">
                ₹{totalAmount}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              style={{ backgroundColor: "#D95B35", color: "#FFFFFF" }}
              className="w-full h-16 text-white font-bold rounded-full transition-all duration-300 hover:bg-[#C44D2A] hover:shadow-[0_0_22px_rgba(217,91,53,0.55),0_12px_28px_rgba(61,43,31,0.18)] flex items-center justify-center gap-2 text-xl shadow-none"
            >
              Proceed to Checkout
              <ArrowRight className="w-6 h-6 text-white" />
            </button>
            <p className="text-sm text-taupe text-center">
              Payment via QR code after order confirmation
            </p>
          </div>
        )}

        {showCheckout && (
          <div className="border-t border-espresso/10 px-6 pt-6 pb-6 space-y-4 bg-cream text-espresso rounded-t-[32px] shadow-none">
            <div className="flex justify-between items-center px-2">
              <span className="text-espresso font-semibold text-sm">Subtotal</span>
              <span className="font-sans text-sm font-bold text-espresso">
                ₹{(Number(totalAmount) - Number(totalGst)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-espresso font-semibold text-sm">GST Taxes</span>
              <span className="font-sans text-sm font-bold text-espresso/70">
                ₹{totalGst}
              </span>
            </div>
            <div className="flex justify-between items-center px-2 pt-2 border-t border-espresso/10">
              <span className="text-espresso font-semibold text-lg">Grand Total</span>
              <span className="font-sans text-2xl font-bold text-burnt-orange">
                ₹{totalAmount}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!canPlaceOrder || isSubmitting}
              style={!canPlaceOrder || isSubmitting ? { backgroundColor: "rgba(61,43,31,0.1)", color: "rgba(61,43,31,0.4)" } : { backgroundColor: "#D95B35", color: "#FFFFFF" }}
              className={`w-full h-16 font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-xl ${!canPlaceOrder || isSubmitting
                ? "cursor-not-allowed shadow-none"
                : "hover:bg-[#C44D2A] hover:shadow-[0_0_22px_rgba(217,91,53,0.55),0_12px_28px_rgba(61,43,31,0.18)]"
                }`}
            >
              {isSubmitting ? "Placing Order..." : "Place Order via WhatsApp"}
              {!isSubmitting && <ArrowRight className="w-6 h-6" />}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flyOutLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-150px);
            opacity: 0;
          }
        }
        .animate-fly-out-left {
          animation: flyOutLeft 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </>
  );
}
