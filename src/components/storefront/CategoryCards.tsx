import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '../../types/ecommerce';

interface CategoryCardsProps {
  categories: Category[];
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ categories }) => {
  return (
    <section className="py-14 sm:py-20 bg-[#FCFAF7] border-b border-[#E8D8CC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Editorial Header like reference image */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#4A2818] tracking-tight mb-3">
            Handcrafted Essentials
          </h2>
          <p className="text-sm sm:text-base text-[#7A6153] leading-relaxed">
            Select your sweet craft. Calibrated couverture, professional moulds, fine toppers, and patisserie creams.
          </p>
        </div>

        {/* 3-Column / 4-Column Card Grid matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative flex flex-col justify-between bg-white rounded-[2rem] p-4 sm:p-5 border border-[#E8D8CC] hover:border-[#4A2818]/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Product / Category Image with Rounded Corners */}
              <div className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-[#F9F4EE] mb-4 relative">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Info & Circular Action Button Row */}
              <div className="flex items-end justify-between gap-3 pt-1">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4A2818] group-hover:text-[#673D26] transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#7A6153] line-clamp-1 mt-0.5">
                    {category.description}
                  </p>
                  <div className="text-[11px] font-semibold text-[#4A2818]/60 mt-1 flex items-center gap-1">
                    <span>View Collection</span>
                    <span>&gt;</span>
                  </div>
                </div>

                {/* Circular Action Button like in reference image */}
                <div 
                  className="w-10 h-10 rounded-full bg-[#F2E7DC] group-hover:bg-[#4A2818] text-[#4A2818] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#F2E7DC] hover:bg-[#4A2818] text-[#4A2818] hover:text-[#F9F4EE] font-medium text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all duration-200 shadow-sm"
          >
            <span>Browse All 10 Categories</span>
            <span className="text-xs">&gt;</span>
          </Link>
        </div>

      </div>
    </section>
  );
};
