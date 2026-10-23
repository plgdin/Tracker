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
      className="group relative flex flex-col justify-between bg-white rounded-3xl p-3.5 sm:p-4 border-2 border-[#351E28]/10 hover:border-[#351E28] transition-all duration-300 hover:-translate-y-1 hover:shadow-card cursor-pointer"
    >
      {/* Top Media Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F8F7F0] mb-3.5 border border-[#351E28]/5">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#FF5C34] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Featured / Bestseller Badge */}
        {product.isFeatured && (
          <div className="absolute top-2.5 right-2.5 bg-[#EAF05C] border border-[#351E28]/10 text-[#351E28] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-[#351E28]" />
            <span>Featured</span>
          </div>
        )}

        {/* Out of Stock overlay if stock is 0 */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-[#351E28]/70 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-white text-[#351E28] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#351E28]/60 mb-1">
            <span className="font-semibold uppercase tracking-wider truncate">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-[#351E28] font-bold">
              <Star className="w-3 h-3 fill-[#FF5C34] text-[#FF5C34]" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#351E28]/40">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-heading font-black text-sm sm:text-base text-[#351E28] group-hover:text-[#FF5C34] transition-colors line-clamp-2 leading-snug mb-1">
            {product.name}
          </h3>

          {/* Short description / unit indicator */}
          <p className="text-[11px] text-[#351E28]/60 line-clamp-1 mb-2.5">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#351E28]/5 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-black text-base sm:text-lg text-[#351E28]">
                ₹{price}
              </span>
              {originalPrice && (
                <span className="text-xs text-[#351E28]/40 line-through font-semibold">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            {hasVariants && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#AEBBA0] font-bold">
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
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full font-bold text-xs transition-all active:scale-95 shadow-sm ${
              justAdded
                ? 'bg-[#AEBBA0] text-[#351E28]'
                : product.stock <= 0
                ? 'bg-[#351E28]/10 text-[#351E28]/40 cursor-not-allowed'
                : 'bg-[#FF5C34] hover:bg-[#e44c26] text-white'
            }`}
            title="Quick add to cart"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.3]" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
