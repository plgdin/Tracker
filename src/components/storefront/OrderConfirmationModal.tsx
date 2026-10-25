import React from 'react';
import { CheckCircle2, MessageCircle, MapPin, ArrowRight, X } from 'lucide-react';
import type { Order, StoreSettings } from '../../types/ecommerce';
import { Link } from 'react-router-dom';

interface OrderConfirmationModalProps {
  order: Order | null;
  whatsappUrl: string;
  settings: StoreSettings;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  whatsappUrl,
  settings,
  onClose,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#361B0E]/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl p-6 sm:p-8 text-center my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F2E7DC] hover:bg-[#4A2818] hover:text-[#F9F4EE] text-[#4A2818] flex items-center justify-center border border-[#E8D8CC] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#F2E7DC] mx-auto flex items-center justify-center text-[#4A2818] mb-4">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <span className="inline-block bg-[#F2E7DC] text-[#4A2818] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Order Created Successfully
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2818] mb-1">
          Thank You, {order.customerName}!
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6153] mb-5 font-normal">
          Your order has been recorded in our store system.
        </p>

        {/* Order Details Card */}
        <div className="p-4 bg-[#F9F4EE] rounded-2xl border border-[#E8D8CC] text-left space-y-2.5 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#E8D8CC]">
            <span className="text-xs font-medium text-[#7A6153]">Order Reference</span>
            <span className="font-serif font-bold text-sm text-[#4A2818]">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7A6153]">Pickup Slot:</span>
            <span className="font-medium text-[#4A2818]">{order.pickupPreference}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7A6153]">Total Amount:</span>
            <span className="font-serif font-bold text-base text-[#4A2818]">₹{order.total}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7A6153]">Items Count:</span>
            <span className="font-medium text-[#4A2818]">{order.items.length} items</span>
          </div>

          <div className="pt-2 border-t border-[#E8D8CC] flex items-start gap-2 text-[11px] text-[#7A6153]">
            <MapPin className="w-4 h-4 text-[#4A2818] shrink-0 mt-0.5" />
            <span>{settings.address || 'NayaKart Main Market Road, Trivandrum, Kerala, India'}</span>
          </div>
        </div>

        {/* WhatsApp Notice & Button */}
        <div className="p-3 bg-[#F2E7DC] rounded-2xl border border-[#E8D8CC] text-xs text-[#4A2818] mb-6">
          <p className="font-medium mb-2 leading-relaxed">
            📲 A WhatsApp window has been opened with your order summary. Send it to the store owner to fast-track your packing!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#4A2818]" />
            <span>Re-open WhatsApp Chat Message</span>
          </a>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm transition-all shadow-sm"
          >
            Continue Shopping
          </button>
          <Link
            to="/admin/orders"
            onClick={onClose}
            className="py-3 px-4 rounded-full border border-[#E8D8CC] text-[#4A2818] font-medium text-xs hover:bg-[#F9F4EE] flex items-center justify-center gap-1"
          >
            <span>View in Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
