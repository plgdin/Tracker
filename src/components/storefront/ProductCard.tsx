import React, { useState } from 'react';
import { ShoppingBag, Star, Check, Sparkles, Layers } from 'lucide-react';
import type { Product } from '../../types/ecommerce';
import { useCartContext } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addItem } = useCartContext();
  const [justAdded, setJustAdded] = useState(false);

  const price = product.discountPrice || product.price;
  const originalPrice = product.discountPrice ? product.price : undefined;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const hasVariants = product.variants && product.variants.length > 0;
  const defaultVariant = hasVariants ? product.variants![0] : undefined;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: defaultVariant?.discountPrice || defaultVariant?.price || price,
      originalPrice: defaultVariant?.price || originalPrice,
      image: product.images[0],
      selectedVariant: defaultVariant?.name,
      categoryName: product.categoryName,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col justify-between bg-white rounded-[2rem] p-4 border border-[#E8D8CC] hover:border-[#4A2818]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-[#F9F4EE] mb-3.5 border border-[#E8D8CC]/60">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#4A2818] text-[#F9F4EE] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Featured / Bestseller Badge */}
        {product.isFeatured && (
          <div className="absolute top-2.5 right-2.5 bg-[#F2E7DC] text-[#4A2818] border border-[#E8D8CC] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-[#4A2818]" />
            <span>Featured</span>
          </div>
        )}

        {/* Out of Stock overlay if stock is 0 */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-[#4A2818]/70 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-[#FCFAF7] text-[#4A2818] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#7A6153] mb-1">
            <span className="font-semibold uppercase tracking-wider truncate">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-[#4A2818] font-bold">
              <Star className="w-3 h-3 fill-[#C87D55] text-[#C87D55]" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#7A6153]/60">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#4A2818] group-hover:text-[#673D26] transition-colors line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>

          {/* Short description / unit indicator */}
          <p className="text-[11px] text-[#7A6153] line-clamp-1 mb-2.5">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#E8D8CC]/60 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-base sm:text-lg text-[#4A2818] tabular-nums">
                ₹{price}
              </span>
              {originalPrice && (
                <span className="text-xs text-[#7A6153]/60 line-through font-semibold tabular-nums">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            {hasVariants && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#7A6153] font-medium">
                <Layers className="w-2.5 h-2.5" />
                {product.variants!.length} sizes
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full font-medium text-xs transition-all active:scale-95 shadow-xs ${
              justAdded
                ? 'bg-[#EAD9CF] text-[#4A2818]'
                : product.stock <= 0
                ? 'bg-[#E8D8CC]/40 text-[#7A6153]/40 cursor-not-allowed'
                : 'bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE]'
            }`}
            title="Add to cart"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative flex flex-col justify-between bg-white rounded-[2rem] p-4 border border-[#E8D8CC] animate-pulse motion-reduce:animate-none pointer-events-none select-none"
    >
      {/* Top Media Container skeleton */}
      <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden bg-[#F2E7DC] mb-3.5 border border-[#E8D8CC]/40" />

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* Category tag */}
          <div className="h-3.5 w-16 bg-[#E8D8CC]/70 rounded-full" />
          {/* Title lines */}
          <div className="h-4.5 w-5/6 bg-[#E8D8CC] rounded-md" />
          <div className="h-3 w-1/2 bg-[#E8D8CC]/50 rounded-md" />
          {/* Star rating */}
          <div className="h-3 w-20 bg-[#E8D8CC]/50 rounded-full pt-0.5" />
        </div>

        {/* Price & action button */}
        <div className="pt-2 border-t border-[#E8D8CC]/40 flex items-center justify-between">
          <div className="h-5 w-16 bg-[#E8D8CC] rounded-md" />
          <div className="h-8 w-16 bg-[#E8D8CC]/80 rounded-full" />
        </div>
      </div>
    </div>
  );
};

