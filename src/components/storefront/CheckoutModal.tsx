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
      // 1. Create order in decoupled service layer
      const order = await orderService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerWhatsapp: customerWhatsapp.trim() || customerPhone.trim(),
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          selectedVariant: it.selectedVariant,
          categoryName: it.categoryName,
        })),
        totalAmount,
        pickupPreference,
        notes: notes.trim(),
      });

      // 2. Generate WhatsApp Click-to-Chat URL
      const whatsappUrl = orderService.generateWhatsAppUrl(order, settings);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#361B0E]/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F9F4EE] border-b border-[#E8D8CC] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A2818]" />
              <span className="text-xs font-semibold text-[#7A6153]">
                Express Trivandrum Counter Pickup
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#4A2818] mt-0.5">
              Confirm Your Order
            </h2>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center border border-[#E8D8CC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          
          {/* Pickup Address Alert */}
          <div className="p-4 bg-[#F2E7DC] rounded-2xl border border-[#E8D8CC] flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#4A2818] shrink-0 mt-0.5" />
            <div className="text-xs text-[#4A2818]">
              <div className="font-serif font-bold text-[#4A2818] mb-0.5">Counter Pickup Location:</div>
              <div className="text-[#7A6153]">{settings.address || 'Bake & Joy Main Market Road, Trivandrum, Kerala, India'}</div>
              <div className="mt-1 text-[11px] font-semibold text-[#4A2818]">
                Payment will be handled at the shop counter via UPI, Cash, or Card!
              </div>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full bg-[#FCFAF7] border rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#4A2818] placeholder-[#7A6153]/50 outline-none transition-all ${
                    errors.customerName ? 'border-red-500' : 'border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white'
                  }`}
                />
                <User className="w-4 h-4 text-[#7A6153] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerName && (
                <p className="text-[11px] text-red-500 font-medium mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Phone & WhatsApp Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 98451 22334"
                    className={`w-full bg-[#FCFAF7] border rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#4A2818] placeholder-[#7A6153]/50 outline-none transition-all ${
                      errors.customerPhone ? 'border-red-500' : 'border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-[#7A6153] absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                {errors.customerPhone && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                  WhatsApp Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="Same as mobile if empty"
                    className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#4A2818] placeholder-[#7A6153]/50 outline-none transition-all"
                  />
                  <MessageCircle className="w-4 h-4 text-[#7A6153] absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Pickup Preference */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
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
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      pickupPreference === slot
                        ? 'bg-[#4A2818] border-[#4A2818] text-[#F9F4EE] shadow-xs'
                        : 'bg-[#FCFAF7] border-[#E8D8CC] text-[#7A6153] hover:border-[#4A2818]/40'
                    }`}
                  >
                    <span>{slot}</span>
                    {pickupPreference === slot && <CheckCircle2 className="w-4 h-4 text-[#F9F4EE]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please request ice packing for chocolates or specific collection time."
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] placeholder-[#7A6153]/50 outline-none transition-all"
              />
            </div>

            {/* Order Summary Snapshot */}
            <div className="p-4 bg-[#F9F4EE] rounded-2xl border border-[#E8D8CC] space-y-2">
              <div className="flex items-center justify-between text-xs font-serif font-bold text-[#4A2818] mb-1">
                <span>Selected Items ({items.length})</span>
                <span>Subtotal</span>
              </div>
              <div className="max-h-32 overflow-y-auto divide-y divide-[#E8D8CC]/50 pr-1 text-xs">
                {items.map((it, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between text-[#7A6153]">
                    <span className="truncate pr-2">
                      {it.quantity} × {it.name} {it.selectedVariant ? `(${it.selectedVariant})` : ''}
                    </span>
                    <span className="font-serif font-bold text-[#4A2818]">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#E8D8CC] flex justify-between items-baseline">
                <span className="font-serif font-bold text-sm text-[#4A2818]">Final Payable at Counter</span>
                <span className="font-serif font-bold text-xl text-[#4A2818]">₹{totalAmount}</span>
              </div>
            </div>

          </form>

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-[#F9F4EE] border-t border-[#E8D8CC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#7A6153] text-center sm:text-left">
            <span className="font-semibold text-[#4A2818]">Clicking Place Order</span> opens WhatsApp to send your request directly to the store!
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#E8D8CC] font-medium text-xs text-[#4A2818] hover:bg-white"
            >
              Back
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#4A2818]" />
              <span>{isSubmitting ? 'Placing Order...' : `Place Order (₹${totalAmount})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
