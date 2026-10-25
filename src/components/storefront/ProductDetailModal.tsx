import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Star, 
  Check, 
  MessageCircle, 
  PackageCheck,
  Plus,
  Minus
} from 'lucide-react';
import type { Product, ProductVariant } from '../../types/ecommerce';
import { useCartContext } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  whatsappNumber = '919999999999',
}) => {
  const { addItem, setIsCartOpen } = useCartContext();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || '');
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product]);

  if (!product) return null;

  // Active pricing based on variant or base product
  const activePrice = selectedVariant
    ? selectedVariant.discountPrice || selectedVariant.price
    : product.discountPrice || product.price;

  const activeOriginalPrice = selectedVariant
    ? selectedVariant.discountPrice ? selectedVariant.price : undefined
    : product.discountPrice ? product.price : undefined;

  const discountPercent = activeOriginalPrice
    ? Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: activePrice,
        originalPrice: activeOriginalPrice,
        image: selectedImage,
        selectedVariant: selectedVariant?.name,
        categoryName: product.categoryName,
      },
      quantity
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setIsCartOpen(true);
      onClose();
    }, 600);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hi Bake & Joy, I am interested in: "${product.name}" (Price: ₹${activePrice}). Do you currently have it in stock at your Trivandrum store?`
    );
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-3xl bg-white rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#F2E7DC] hover:bg-[#4A2818] hover:text-[#F9F4EE] text-[#4A2818] flex items-center justify-center border border-[#E8D8CC] transition-all shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-[#F9F4EE] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E8D8CC]">
            <div className="relative w-full aspect-square rounded-[1.75rem] overflow-hidden bg-white border border-[#E8D8CC] shadow-xs">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#4A2818] text-[#F9F4EE] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-[#4A2818] scale-105 shadow-md'
                        : 'border-[#E8D8CC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* In-Store Counter Ready Notice */}
            <div className="mt-4 p-3 bg-white rounded-2xl border border-[#E8D8CC] flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-[#4A2818] shrink-0" />
              <div className="text-[11px] text-[#7A6153] leading-tight">
                <span className="font-serif font-bold text-[#4A2818]">Trivandrum Counter Pickup:</span> Ready within 30 minutes during shop hours.
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Controls */}
          <div className="p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category, Brand & Rating */}
              <div className="flex items-center justify-between text-xs text-[#7A6153] mb-2">
                <span className="font-semibold text-[#4A2818] uppercase tracking-wider">
                  {product.categoryName}
                </span>
                {product.brand && (
                  <span className="bg-[#F2E7DC] text-[#4A2818] px-2.5 py-0.5 rounded-full font-medium text-[10px]">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2818] leading-tight mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-[#F9F4EE] px-2.5 py-1 rounded-full border border-[#E8D8CC] text-xs font-bold text-[#4A2818]">
                  <Star className="w-3.5 h-3.5 fill-[#C87D55] text-[#C87D55]" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-[#7A6153]/70 font-medium">
                  ({product.reviewsCount} verified reviews)
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4 p-3.5 bg-[#F9F4EE] rounded-2xl border border-[#E8D8CC]">
                <span className="font-serif font-bold text-2xl sm:text-3xl text-[#4A2818]">
                  ₹{activePrice}
                </span>
                {activeOriginalPrice && (
                  <span className="text-sm text-[#7A6153]/60 line-through font-semibold">
                    ₹{activeOriginalPrice}
                  </span>
                )}
                <span className="text-xs font-medium text-[#7A6153] ml-auto">
                  Inclusive of taxes
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#351E28]/80 leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Variant Selector (if any) */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-2">
                    Select Option / Pack Size:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#4A2818] border-[#4A2818] text-[#F9F4EE] shadow-xs'
                              : 'bg-white border-[#E8D8CC] text-[#7A6153] hover:border-[#4A2818]'
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="ml-1.5 opacity-75">₹{v.discountPrice || v.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Picker & Stock Status */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center border border-[#E8D8CC] rounded-full p-1 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-serif font-bold text-sm text-[#4A2818]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F9F4EE] text-[#4A2818] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  {currentStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A2818]">
                      <span className="w-2 h-2 rounded-full bg-[#4A2818]" />
                      In Stock ({currentStock} available)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-500">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-3.5 rounded-full font-serif font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                  addedSuccess
                    ? 'bg-[#EAD9CF] text-[#4A2818]'
                    : currentStock <= 0
                    ? 'bg-[#E8D8CC]/40 text-[#7A6153]/40 cursor-not-allowed'
                    : 'bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                    <span>Add to Cart · ₹{activePrice * quantity}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 rounded-full font-medium text-xs bg-[#F2E7DC] hover:bg-[#E8D8CC] text-[#4A2818] border border-[#E8D8CC] flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#4A2818]" />
                <span>Ask Trivandrum Store on WhatsApp</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
