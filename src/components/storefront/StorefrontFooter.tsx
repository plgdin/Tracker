import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Mail, ShieldCheck, Heart } from 'lucide-react';
import type { Category, StoreSettings } from '../../types/ecommerce';

interface StorefrontFooterProps {
  settings: StoreSettings;
  categories: Category[];
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ settings, categories }) => {
  return (
    <footer className="bg-[#361B0E] text-[#F9F4EE] pt-14 pb-8 border-t border-[#4A2818]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#F9F4EE]/10">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-medium tracking-tight text-[#F9F4EE] italic">
                {settings.storeName || 'Bake & Joy'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F9F4EE]/75 leading-relaxed font-normal">
              {settings.description ||
                'Bangalore’s favourite artisan baking pantry and cake decoration store. Equipping home bakers, patisseries, and dessert chefs with pure couverture, silicone moulds, toppers, and packaging.'}
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#F2E7DC] text-[#4A2818] font-medium px-4 py-2 rounded-full hover:bg-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Desk</span>
              </a>

              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#F9F4EE] font-medium px-4 py-2 rounded-full transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#F2E7DC] uppercase">
              Featured Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#F9F4EE]/80">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/products?category=${c.id}`}
                    className="hover:text-[#F2E7DC] transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#F2E7DC] uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#F9F4EE]/80">
              <li>
                <Link to="/" className="hover:text-[#F2E7DC] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#F2E7DC] transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=cat-cake-decoration" className="hover:text-[#F2E7DC] transition-colors">Cake Decor</Link>
              </li>
              <li>
                <Link to="/products?category=cat-baking-ingredients" className="hover:text-[#F2E7DC] transition-colors">Ingredients</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#F2E7DC] transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Store Visit & Timings */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wider text-[#F2E7DC] uppercase">
              Bangalore Pantry & Counter
            </h4>
            <div className="space-y-2 text-xs text-[#F9F4EE]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F2E7DC] shrink-0 mt-0.5" />
                <span>{settings.address || 'Bake & Joy Main Market Road, Bangalore, Karnataka, India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F2E7DC] shrink-0" />
                <span>{settings.phone || '+91 98450 12345'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F2E7DC] shrink-0" />
                <span>{settings.email || 'hello@bakeandjoy.in'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#F9F4EE]/70 mt-2">
                <strong>Counter Hours:</strong> {settings.openingHours || 'Mon – Sat: 9:30 AM – 8:30 PM | Sun: 10:00 AM – 6:00 PM'}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F9F4EE]/60">
          <div>
            &copy; {new Date().getFullYear()} {settings.storeName || 'Bake & Joy'}. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Crafted for bakers across Bangalore</span>
            <Heart className="w-3.5 h-3.5 text-[#F2E7DC] fill-[#F2E7DC]" />
          </div>
        </div>

      </div>
    </footer>
  );
};
