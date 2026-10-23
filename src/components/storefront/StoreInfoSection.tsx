import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Award, 
  Sparkles, 
  Navigation,
  HeartHandshake
} from 'lucide-react';
import type { StoreSettings } from '../../types/ecommerce';

interface StoreInfoSectionProps {
  settings: StoreSettings;
}

export const StoreInfoSection: React.FC<StoreInfoSectionProps> = ({ settings }) => {
  return (
    <section className="py-14 sm:py-20 bg-white border-t border-[#351E28]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#EAF05C] text-[#351E28] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-[#351E28]" />
            <span>Visit Our Bangalore Store</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#351E28] tracking-tight mb-3">
            Your Local Baking Sanctuary
          </h2>
          <p className="text-sm sm:text-base text-[#351E28]/70 leading-relaxed">
            Step into our physical store or pick up your online WhatsApp orders in person. 
            Touch the moulds, inspect the nozzles, and smell the pure bourbon vanilla before you buy.
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Store Card & Directions */}
          <div className="lg:col-span-7 bg-[#F8F7F0] rounded-3xl p-6 sm:p-8 border-2 border-[#351E28] shadow-card flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#351E28] text-[#EAF05C] flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-[#351E28] mb-1">
                    Store Location & Counter
                  </h3>
                  <p className="text-sm text-[#351E28]/80 font-medium leading-relaxed">
                    {settings.address || 'Bake & Joy Main Market Road, Bangalore, Karnataka, India'}
                  </p>
                  <p className="text-xs text-[#AEBBA0] font-bold mt-1">
                    Easily accessible · Dedicated customer parking out front
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D7EFFF] text-[#351E28] flex items-center justify-center shrink-0 border border-[#351E28]/15">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-[#351E28] mb-1">
                    Opening Hours
                  </h3>
                  <p className="text-sm text-[#351E28]/80 font-medium">
                    {settings.openingHours || 'Mon – Sat: 9:30 AM to 8:30 PM · Sunday: 10:00 AM to 6:00 PM'}
                  </p>
                  <p className="text-xs text-[#FF5C34] font-bold mt-1">
                    Online WhatsApp ordering open 24/7
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF05C] text-[#351E28] flex items-center justify-center shrink-0 border border-[#351E28]/20">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl text-[#351E28] mb-1">
                    Direct Store Contact
                  </h3>
                  <p className="text-sm text-[#351E28]/80 font-medium">
                    Call: <a href={`tel:${settings.phone || '+919845012345'}`} className="font-bold hover:text-[#FF5C34] transition-colors">{settings.phone || '+91 98450 12345'}</a>
                  </p>
                  <p className="text-xs text-[#351E28]/60 mt-1">
                    Email: {settings.email || 'hello@bakeandjoy.in'}
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[#351E28]/10 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}?text=Hi%20Bake%20%26%20Joy%2C%20I%20would%20like%20to%20visit%20your%20Bangalore%20store`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF5C34] hover:bg-[#e44c26] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#FF5C34]" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#D7EFFF] text-[#351E28] font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full border-2 border-[#351E28]/20 transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4 text-[#351E28]" />
                <span>Get Google Maps Directions</span>
              </a>
            </div>

          </div>

          {/* Right: 4 Guarantees Cards in Brand Palette */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            <div className="p-5 rounded-3xl bg-[#D7EFFF] border-2 border-[#351E28] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#351E28] shrink-0 border border-[#351E28]/10">
                <Award className="w-5 h-5 text-[#FF5C34]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-[#351E28] mb-0.5">
                  100% Genuine Supplies
                </h4>
                <p className="text-xs text-[#351E28]/70 leading-relaxed">
                  Direct stock from Callebaut, Tropelite, Chefmaster, and trusted certified bakeries.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#AEBBA0]/30 border-2 border-[#351E28] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#351E28] shrink-0 border border-[#351E28]/10">
                <Clock className="w-5 h-5 text-[#351E28]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-[#351E28] mb-0.5">
                  Express Counter Ready
                </h4>
                <p className="text-xs text-[#351E28]/70 leading-relaxed">
                  Submit via WhatsApp and your items will be neatly packed at the counter in 30 minutes.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#EAF05C]/35 border-2 border-[#351E28] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#351E28] shrink-0 border border-[#351E28]/10">
                <HeartHandshake className="w-5 h-5 text-[#FF5C34]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-base text-[#351E28] mb-0.5">
                  Expert Baker Guidance
                </h4>
                <p className="text-xs text-[#351E28]/70 leading-relaxed">
                  Our in-store crew answers queries on cocoa percentages, nozzle sizes, and fondant tricks.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
