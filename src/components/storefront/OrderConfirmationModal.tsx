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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-[#351E28] shadow-2xl p-6 sm:p-8 text-center my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F8F7F0] hover:bg-[#351E28] hover:text-[#EAF05C] text-[#351E28] flex items-center justify-center border border-[#351E28]/15 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon with Wasabi highlight */}
        <div className="w-20 h-20 rounded-full bg-[#EAF05C] border-2 border-[#351E28] mx-auto flex items-center justify-center text-[#351E28] mb-5 shadow-pop-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Title */}
        <span className="inline-block bg-[#D7EFFF] text-[#351E28] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Order Created Successfully
        </span>
        <h2 className="font-heading text-3xl font-black text-[#351E28] mb-1">
          Thank You, {order.customerName}!
        </h2>
        <p className="text-xs sm:text-sm text-[#351E28]/70 mb-5">
          Your order has been recorded in our store system.
        </p>

        {/* Order Details Card */}
        <div className="p-4 bg-[#F8F7F0] rounded-2xl border-2 border-[#351E28]/10 text-left space-y-2.5 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#351E28]/10">
            <span className="text-xs font-semibold text-[#351E28]/60">Order Reference</span>
            <span className="font-heading font-black text-sm text-[#FF5C34]">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#351E28]/70">Pickup Slot:</span>
            <span className="font-bold text-[#351E28]">{order.pickupPreference}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#351E28]/70">Total Amount:</span>
            <span className="font-heading font-black text-base text-[#351E28]">₹{order.total}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[#351E28]/70">Items Count:</span>
            <span className="font-bold text-[#351E28]">{order.items.length} items</span>
          </div>

          <div className="pt-2 border-t border-[#351E28]/10 flex items-start gap-2 text-[11px] text-[#351E28]/80">
            <MapPin className="w-4 h-4 text-[#FF5C34] shrink-0 mt-0.5" />
            <span>{settings.address || 'Bake & Joy Main Market Road, Bangalore, Karnataka, India'}</span>
          </div>
        </div>

        {/* WhatsApp Notice & Button */}
        <div className="p-3 bg-[#EAF05C]/30 rounded-2xl border border-[#351E28]/10 text-xs text-[#351E28] mb-6">
          <p className="font-semibold mb-2">
            📲 A WhatsApp window has been opened with your order summary. Send it to the store owner to fast-track your packing!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#351E28] hover:bg-[#4a2b38] text-[#EAF05C] font-bold text-xs shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-[#EAF05C] text-[#351E28]" />
            <span>Re-open WhatsApp Chat Message</span>
          </a>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-sm transition-all shadow-md"
          >
            Continue Shopping
          </button>
          <Link
            to="/admin/orders"
            onClick={onClose}
            className="py-3.5 px-4 rounded-full border border-[#351E28]/20 text-[#351E28] font-bold text-xs hover:bg-[#F8F7F0] flex items-center justify-center gap-1"
          >
            <span>View in Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
