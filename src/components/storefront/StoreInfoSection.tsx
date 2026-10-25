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
    <section className="py-16 sm:py-20 bg-[#FCFAF7] border-t border-[#E8D8CC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#4A2818] tracking-tight mb-3">
            Visit Our Store
          </h2>
          <p className="text-sm sm:text-base text-[#7A6153] leading-relaxed">
            Step into our bakery supplies showroom or pick up your online WhatsApp orders in person. 
            Touch the moulds, inspect the nozzles, and smell the pure vanilla before you buy.
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Store Card & Directions */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-6 sm:p-8 border border-[#E8D8CC] shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A2818] mb-1">
                    Store Location & Counter
                  </h3>
                  <p className="text-sm text-[#7A6153] font-normal leading-relaxed">
                    {settings.address || 'TC.1/4575 (1) Ground Floor, Kazhakoottam to Karyavattom Road, Kazhakuttam, Thiruvananthapuram - 695582, Kerala'}
                  </p>
                  <p className="text-xs text-[#4A2818]/60 font-medium mt-1">
                    Kazhakuttam, Thiruvananthapuram · Easy customer parking available
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A2818] mb-1">
                    Opening Hours
                  </h3>
                  <p className="text-sm text-[#7A6153] font-normal">
                    {settings.openingHours || 'Mon – Sat: 10:30 AM to 9:00 PM · Sunday: 10:30 AM to 3:00 PM'}
                  </p>
                  <p className="text-xs text-[#4A2818] font-semibold mt-1">
                    WhatsApp pickup requests processed daily
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A2818] mb-1">
                    Direct Contact
                  </h3>
                  <p className="text-sm text-[#7A6153] font-normal">
                    Call: <a href={`tel:${settings.phone || '+919447113608'}`} className="font-bold text-[#4A2818] hover:text-[#673D26] transition-colors">{settings.phone || '+91 94471 13608'}</a>
                  </p>
                  <p className="text-xs text-[#7A6153]/70 mt-0.5">
                    Email: {settings.email || 'hello@nayakart.in'}
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[#E8D8CC]/60 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919447113608').replace(/\D/g, '')}?text=Hi%20NayaKart%2C%20I%20would%20like%20to%20inquire%20about%20baking%20supplies%20at%20your%20Kazhakuttam%20store`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-medium text-xs sm:text-sm px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#4A2818]" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="https://www.google.com/maps/search/?api=1&query=NayaKart+Kazhakuttam+Thiruvananthapuram"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#F9F4EE] hover:bg-[#F2E7DC] text-[#4A2818] font-medium text-xs sm:text-sm px-5 py-3 rounded-full border border-[#E8D8CC] transition-all"
              >
                <Navigation className="w-4 h-4 text-[#4A2818]" />
                <span>Google Maps Directions</span>
              </a>
            </div>

          </div>

          {/* Right: 3 Guarantees Cards in Warm Bakery Palette */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            
            <div className="p-5 rounded-[1.75rem] bg-white border border-[#E8D8CC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] shrink-0">
                <Award className="w-5 h-5 text-[#4A2818]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#4A2818] mb-0.5">
                  100% Genuine Supplies
                </h4>
                <p className="text-xs text-[#7A6153] leading-relaxed">
                  Direct stock from Callebaut, Tropelite, Chefmaster, and certified confectionery brands.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[1.75rem] bg-white border border-[#E8D8CC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] shrink-0">
                <Clock className="w-5 h-5 text-[#4A2818]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#4A2818] mb-0.5">
                  Express Counter Pickup
                </h4>
                <p className="text-xs text-[#7A6153] leading-relaxed">
                  Submit via WhatsApp and your baking items will be packaged and waiting at the counter.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[1.75rem] bg-white border border-[#E8D8CC] shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#4A2818]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#4A2818] mb-0.5">
                  Baker Guidance Desk
                </h4>
                <p className="text-xs text-[#7A6153] leading-relaxed">
                  Our in-store crew happily answers questions about cocoa tempering, nozzle sizing, and fondants.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
