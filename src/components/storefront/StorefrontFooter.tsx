import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, MapPin, Phone, MessageCircle, Mail, ShieldCheck, Heart } from 'lucide-react';
import type { Category, StoreSettings } from '../../types/ecommerce';

interface StorefrontFooterProps {
  settings: StoreSettings;
  categories: Category[];
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ settings, categories }) => {
  return (
    <footer className="bg-[#351E28] text-[#F8F7F0] pt-14 pb-8 border-t-4 border-[#FF5C34]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#F8F7F0]/10">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF05C] text-[#351E28] flex items-center justify-center shadow-md">
                <Cake className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-heading text-2xl font-black tracking-tight text-white">
                {settings.storeName || 'Bake & Joy'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F8F7F0]/75 leading-relaxed">
              {settings.description ||
                'Your dedicated neighbourhood baking pantry and decoration essentials store in Bangalore. We equip home bakers, patisseries, and dessert artists with fine couverture, moulds, toppers, and packaging.'}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#EAF05C] text-[#351E28] font-bold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Desk</span>
              </a>

              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#F8F7F0] font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5C34]" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-black uppercase tracking-wider text-[#EAF05C]">
              Featured Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#F8F7F0]/80">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/products?category=${c.id}`}
                    className="hover:text-[#FF5C34] transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-sm font-black uppercase tracking-wider text-[#EAF05C]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#F8F7F0]/80">
              <li>
                <Link to="/" className="hover:text-[#FF5C34] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#FF5C34] transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=cat-cake-decoration" className="hover:text-[#FF5C34] transition-colors">Cake Decor</Link>
              </li>
              <li>
                <Link to="/products?category=cat-baking-ingredients" className="hover:text-[#FF5C34] transition-colors">Ingredients</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#FF5C34] transition-colors">Demo Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Store Visit & Timings */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-black uppercase tracking-wider text-[#EAF05C]">
              Store & Pickup Desk
            </h4>
            <div className="space-y-2 text-xs text-[#F8F7F0]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF5C34] shrink-0 mt-0.5" />
                <span>{settings.address || 'Bake & Joy Main Market Road, Bangalore, Karnataka, India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF5C34] shrink-0" />
                <span>{settings.phone || '+91 98450 12345'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF5C34] shrink-0" />
                <span>{settings.email || 'hello@bakeandjoy.in'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#AEBBA0] mt-2">
                <strong>Hours:</strong> {settings.openingHours || 'Mon – Sat: 9:30 AM – 8:30 PM | Sun: 10:00 AM – 6:00 PM'}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F8F7F0]/60">
          <div>
            &copy; {new Date().getFullYear()} {settings.storeName || 'Bake & Joy'}. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with passion for bakers across Bangalore</span>
            <Heart className="w-3 h-3 text-[#FF5C34] fill-[#FF5C34]" />
          </div>
        </div>

      </div>
    </footer>
  );
};
