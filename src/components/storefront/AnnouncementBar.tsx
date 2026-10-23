import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import type { StoreSettings } from '../../types/ecommerce';

interface AnnouncementBarProps {
  settings: StoreSettings;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings }) => {
  return (
    <div className="bg-[#351E28] text-[#F8F7F0] text-xs font-medium py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        {/* Left: Announcement / Offer */}
        <div className="flex items-center gap-2 justify-center">
          <span className="inline-flex items-center justify-center bg-[#EAF05C] text-[#351E28] px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase">
            Special
          </span>
          <span className="text-[#F8F7F0]/90">
            {settings.announcement || '🎂 Bangalore In-Store Counter Pickup Available · Order on WhatsApp for Same-Day Ready!'}
          </span>
        </div>

        {/* Right: Quick Store Highlights */}
        <div className="flex items-center gap-4 text-[11px] text-[#AEBBA0]">
          <div className="hidden md:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#EAF05C]" />
            <span className="text-[#F8F7F0]/80">Main Market Road, Bangalore</span>
          </div>
          <span className="hidden md:inline text-[#AEBBA0]/40">•</span>
          <a
            href={`https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}?text=Hi%20Bake%20%26%20Joy%2C%20I%20have%20an%20inquiry%20about%20baking%20supplies`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#EAF05C] hover:text-white font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Direct WhatsApp Help</span>
          </a>
        </div>
      </div>
    </div>
  );
};
