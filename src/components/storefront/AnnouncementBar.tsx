import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import type { StoreSettings } from '../../types/ecommerce';

interface AnnouncementBarProps {
  settings: StoreSettings;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings }) => {
  return (
    <div className="bg-[#F2E7DC] text-[#4A2818] text-xs font-medium py-2 px-4 border-b border-[#E8D8CC]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        {/* Left: Announcement / Offer */}
        <div className="flex items-center gap-2 justify-center">
          <span className="inline-flex items-center justify-center bg-[#4A2818] text-[#F9F4EE] px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase">
            Trivandrum
          </span>
          <span className="text-[#4A2818]/90">
            {settings.announcement || '🎂 In-Store Counter Pickup Available at Main Market Road · Same-Day Ready!'}
          </span>
        </div>

        {/* Right: Quick Store Highlights */}
        <div className="flex items-center gap-4 text-[11px] text-[#7A6153]">
          <div className="hidden md:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#4A2818]" />
            <span className="text-[#4A2818]/80">Main Market Road, Trivandrum</span>
          </div>
          <span className="hidden md:inline text-[#E8D8CC]">•</span>
          <a
            href={`https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}?text=Hi%20Bake%20%26%20Joy%2C%20I%20have%20an%20inquiry%20about%20baking%20supplies`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#4A2818] hover:text-[#361B0E] font-bold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Inquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
};
