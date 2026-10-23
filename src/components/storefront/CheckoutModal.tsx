import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  MessageCircle, 
  CheckCircle2
} from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import type { Order, StoreSettings } from '../../types/ecommerce';

interface CheckoutModalProps {
  settings: StoreSettings;
  onOrderSuccess: (order: Order, whatsappUrl: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ settings, onOrderSuccess }) => {
  const { items, totalAmount, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCartContext();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [pickupPreference, setPickupPreference] = useState('Today (Within 2 Hours)');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Please enter your full name';
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    if (customerWhatsapp.trim()) {
      const cleanWa = customerWhatsapp.replace(/\D/g, '');
      if (cleanWa.length < 10) {
        errs.customerWhatsapp = 'WhatsApp number should be 10 digits';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Create order record in demo orderService
      const { order, whatsappUrl } = await orderService.create({
        customerName,
        customerPhone,
        customerWhatsapp: customerWhatsapp || customerPhone,
        pickupPreference,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          variantName: i.selectedVariant,
          unitPrice: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      });

      // 2. Open WhatsApp in new tab with populated order message
      window.open(whatsappUrl, '_blank');

      // 3. Clear cart
      clearCart();

      // 4. Close checkout and show confirmation
      setIsCheckoutOpen(false);
      onOrderSuccess(order, whatsappUrl);
    } catch (err) {
      console.error('Order creation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl border-2 border-[#351E28] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F8F7F0] border-b border-[#351E28]/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C34]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#351E28]/60">
                Express Store Pickup Checkout
              </span>
            </div>
            <h2 className="font-heading text-2xl font-black text-[#351E28]">
              Confirm Your Order
            </h2>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#351E28] hover:text-[#EAF05C] text-[#351E28] flex items-center justify-center border border-[#351E28]/15 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          
          {/* Pickup Address Alert */}
          <div className="p-4 bg-[#D7EFFF]/60 rounded-2xl border border-[#351E28]/10 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#351E28] shrink-0 mt-0.5" />
            <div className="text-xs text-[#351E28]">
              <div className="font-bold text-[#351E28] mb-0.5">Physical Store Counter Pickup Location:</div>
              <div className="text-[#351E28]/80">{settings.address || 'Bake & Joy Main Market Road, Bangalore, Karnataka, India'}</div>
              <div className="mt-1 text-[11px] font-semibold text-[#FF5C34]">
                Payment will be handled at the shop counter via UPI, Cash, or Card!
              </div>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/80 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full bg-[#F8F7F0] border-2 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-[#351E28] placeholder-[#351E28]/40 outline-none transition-all ${
                    errors.customerName ? 'border-red-500' : 'border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white'
                  }`}
                />
                <User className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerName && (
                <p className="text-[11px] text-red-500 font-bold mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Phone & WhatsApp Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/80 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98451 22334"
                    className={`w-full bg-[#F8F7F0] border-2 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-[#351E28] placeholder-[#351E28]/40 outline-none transition-all ${
                      errors.customerPhone ? 'border-red-500' : 'border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                {errors.customerPhone && (
                  <p className="text-[11px] text-red-500 font-bold mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/80 mb-1.5">
                  WhatsApp Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="Same as mobile if empty"
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-[#351E28] placeholder-[#351E28]/40 outline-none transition-all"
                  />
                  <MessageCircle className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Pickup Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/80 mb-1.5">
                Counter Pickup Time Preference *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Today (Within 2 Hours)',
                  'Today Evening (5-8 PM)',
                  'Tomorrow Morning (10-1 PM)',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPickupPreference(slot)}
                    className={`p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left flex items-center justify-between ${
                      pickupPreference === slot
                        ? 'bg-[#EAF05C] border-[#351E28] text-[#351E28] shadow-sm'
                        : 'bg-[#F8F7F0] border-[#351E28]/10 text-[#351E28]/70 hover:border-[#351E28]/30'
                    }`}
                  >
                    <span>{slot}</span>
                    {pickupPreference === slot && <CheckCircle2 className="w-4 h-4 text-[#351E28]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/80 mb-1.5">
                Special Instructions or Questions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please keep chocolate away from warm sunlight or request ice packing."
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-semibold text-[#351E28] placeholder-[#351E28]/40 outline-none transition-all"
              />
            </div>

            {/* Order Summary Snapshot */}
            <div className="p-4 bg-[#F8F7F0] rounded-2xl border border-[#351E28]/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#351E28] mb-1">
                <span>Selected Items ({items.length})</span>
                <span>Subtotal</span>
              </div>
              <div className="max-h-32 overflow-y-auto divide-y divide-[#351E28]/5 pr-1 text-xs">
                {items.map((it, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between text-[#351E28]/80">
                    <span className="truncate pr-2">
                      {it.quantity} × {it.name} {it.selectedVariant ? `(${it.selectedVariant})` : ''}
                    </span>
                    <span className="font-black text-[#351E28]">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#351E28]/10 flex justify-between items-baseline">
                <span className="font-heading font-black text-sm text-[#351E28]">Final Amount Payable</span>
                <span className="font-heading font-black text-xl text-[#FF5C34]">₹{totalAmount}</span>
              </div>
            </div>

          </form>

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-[#F8F7F0] border-t border-[#351E28]/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#351E28]/70 text-center sm:text-left">
            <span className="font-bold text-[#351E28]">Clicking Place Order</span> opens WhatsApp to send your order directly to the store owner!
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-[#351E28]/20 font-bold text-xs text-[#351E28] hover:bg-white"
            >
              Back
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C34]/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#FF5C34]" />
              <span>{isSubmitting ? 'Placing Order...' : `Place Order (₹${totalAmount})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
