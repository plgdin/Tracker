import React from 'react';
import { HalftoneWordmarkFooter } from '../ui/halftone-wordmark-footer';
import type { FooterColumn } from '../ui/halftone-wordmark-footer';
import type { Category, StoreSettings } from '../../types/ecommerce';

interface StorefrontFooterProps {
  settings: StoreSettings;
  categories: Category[];
}

export const StorefrontFooter: React.FC<StorefrontFooterProps> = ({ settings, categories }) => {
  const whatsappUrl = `https://wa.me/${(settings.whatsappNumber || '919999999999').replace(/\D/g, '')}`;

  const columns: FooterColumn[] = [
    {
      title: 'Featured Pantry',
      links: categories.slice(0, 4).map((c) => ({
        label: c.name,
        href: `/products?category=${c.id}`,
      })),
    },
    {
      title: 'Store Location',
      links: [
        { label: settings.address || 'Bangalore Main Market Road' },
        { label: settings.openingHours || 'Mon–Sat: 9:30 AM – 8:30 PM' },
        { label: 'Counter Pickup Ready' },
      ],
    },
    {
      title: 'Direct Connect',
      links: [
        { label: 'WhatsApp Order Desk', href: whatsappUrl },
        { label: settings.phone || '+91 98450 12345', href: `tel:${settings.phone || '+919845012345'}` },
        { label: settings.email || 'hello@bakeandjoy.in', href: `mailto:${settings.email || 'hello@bakeandjoy.in'}` },
        { label: 'Store Management Console', href: '/admin/login' },
      ],
    },
  ];

  return (
    <div className="w-full relative">
      <HalftoneWordmarkFooter
        wordmark={(settings.storeName || 'bake & joy').toLowerCase()}
        label={settings.storeName || 'Bake & Joy'}
        meta="Artisan Pantry & Cake Decor · Bangalore Market Road"
        columns={columns}
        palette={{
          background: '#361B0E',
          ink: '#F9F4EE',
          warm: '#E29578',
        }}
        dotGap={6}
        radius={90}
        crop={0.22}
        grain={0.45}
        interactive={true}
        fontFamily="'DM Serif Display', 'Playfair Display', Georgia, serif"
        fontWeight={800}
        monoFamily="'Plus Jakarta Sans', 'Outfit', sans-serif"
        height="560px"
        backToTop={true}
        className="border-t border-[#4A2818]"
      />
    </div>
  );
};

export default StorefrontFooter;
