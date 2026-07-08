import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';

export default function Footer() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('Your premier source for premium cooking and baking ingredients, raw materials, professional utensils, and chef supplies.');
  const [phone, setPhone] = useState('+91-9876543210');
  const [hours, setHours] = useState('9 AM - 8 PM');
  const [days, setDays] = useState('Monday - Saturday');
  const [copyright, setCopyright] = useState('© ' + new Date().getFullYear() + ' Chef & Joy. All rights reserved.');

  useEffect(() => {
    db.getStoreSettings().then(settings => {
      if (settings) {
        if (settings.footer_description) setDescription(settings.footer_description);
        if (settings.footer_phone) setPhone(settings.footer_phone);
        if (settings.footer_hours) setHours(settings.footer_hours);
        if (settings.footer_days) setDays(settings.footer_days);
        if (settings.footer_copyright) setCopyright(settings.footer_copyright);
      }
    }).catch(console.error);
  }, []);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate to home first, then scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark-chocolate text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4">
              Chef & Joy
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button
                onClick={() => scrollToSection('hero')}
                className="block text-white/60 hover:text-burnt-orange transition-colors text-sm text-left"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/products')}
                className="block text-white/60 hover:text-burnt-orange transition-colors text-sm text-left"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection('offers')}
                className="block text-white/60 hover:text-burnt-orange transition-colors text-sm text-left"
              >
                Offers
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-white/60">
              <p>WhatsApp: {phone}</p>
              <p>Store Hours: {hours}</p>
              <p>{days}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-sm">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
