import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUp,
  ShieldCheck,
  Heart
} from 'lucide-react';
import type { Category, StoreSettings } from '../../types/ecommerce';

interface StorefrontFooterProps {
  settings: StoreSettings;
  categories: Category[];
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ settings, categories }) => {
  const storeName = settings.storeName || 'Bake N Joy';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#361B0E] text-[#F9F4EE] border-t border-[#522914]">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl font-normal italic tracking-tight text-[#F9F4EE] hover:text-[#EAD9CF] transition-colors">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-[#D5C2B4] leading-relaxed max-w-sm">
              Trivandrum's premier destination for fine baking supplies, calibrated Belgian couverture chocolates, silicone moulds, and artisanal dessert packaging.
            </p>
          </div>

          {/* Col 2: Categories / Pantry */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAD9CF]">
              Baking Supplies
            </h3>
            <ul className="space-y-2.5 text-sm text-[#D5C2B4]">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-xs font-semibold text-[#E29578] hover:text-white transition-colors">
                  View All Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAD9CF]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-[#D5C2B4]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=cat-cake-decoration" className="hover:text-white transition-colors">
                  Cake Decorations
                </Link>
              </li>
              <li>
                <Link to="/products?category=cat-baking-ingredients" className="hover:text-white transition-colors">
                  Baking Ingredients
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-xs text-[#EAD9CF]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Info & Location */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAD9CF]">
              Store & Contact
            </h3>
            <ul className="space-y-3 text-sm text-[#D5C2B4]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E29578] shrink-0 mt-0.5" />
                <span>{settings.address || 'Trivandrum Main Market Road, Kerala'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#E29578] shrink-0" />
                <span>{settings.openingHours || 'Mon–Sat: 9:30 AM – 8:30 PM'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E29578] shrink-0" />
                <a href={`tel:${settings.phone || '+919845012345'}`} className="hover:text-white transition-colors">
                  {settings.phone || '+91 94471 13608'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E29578] shrink-0" />
                <a href={`mailto:${settings.email || 'bakenjoy.trivandrum@gmail.com'}`} className="hover:text-white transition-colors">
                  {settings.email || 'bakenjoy.trivandrum@gmail.com'}
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer Bar */}
      <div className="border-t border-[#4A2818] bg-[#2A1308]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#C5B3A6]">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-[#E29578] fill-[#E29578]" /> for Trivandrum bakers
            </span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-white transition-colors text-xs font-medium"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;
