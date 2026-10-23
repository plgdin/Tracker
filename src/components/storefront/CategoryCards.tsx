import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Cookie, 
  IceCream, 
  Palette, 
  Crown, 
  Wrench, 
  Layers, 
  Stars, 
  Package, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import type { Category } from '../../types/ecommerce';

interface CategoryCardsProps {
  categories: Category[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Cookie,
  IceCream,
  Palette,
  Crown,
  Wrench,
  Layers,
  Stars,
  Package,
  CheckCircle,
};

export const CategoryCards: React.FC<CategoryCardsProps> = ({ categories }) => {
  return (
    <section className="py-12 sm:py-16 bg-[#F8F7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5C34] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF5C34]" />
              Explore Collections
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#351E28] tracking-tight">
              Bake By Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#351E28] hover:text-[#FF5C34] group transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((category) => {
            const IconComponent = ICON_MAP[category.iconName] || Sparkles;

            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative flex flex-col justify-between bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#351E28]/10 hover:border-[#351E28] transition-all duration-300 hover:-translate-y-1 hover:shadow-card overflow-hidden"
              >
                {/* Background Color Accent Pill at Top */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <IconComponent className="w-6 h-6 text-[#351E28]" />
                </div>

                {/* Category Thumbnail */}
                <div className="w-full h-24 sm:h-28 rounded-2xl overflow-hidden mb-3.5 bg-[#F8F7F0] border border-[#351E28]/10">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="font-heading font-black text-sm sm:text-base text-[#351E28] group-hover:text-[#FF5C34] transition-colors leading-tight mb-1">
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-[#351E28]/60 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Bottom Arrow Indicator */}
                <div className="mt-3 pt-2.5 border-t border-[#351E28]/5 flex items-center justify-between text-[11px] font-bold text-[#FF5C34]">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
