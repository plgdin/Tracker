import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartContext } from "@/context/CartContext";
import { useToastStore } from "@/store/toastStore";

interface ProductCardProps {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  categoryName: string | null;
  inStock: boolean | null;
  onAddedToCart?: (name: string, event: React.MouseEvent<HTMLButtonElement>, image: string | null) => void;
}

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image: string | null;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  categoryName,
  inStock,
  onAddedToCart,
}: ProductCardProps) {
  const { addItem } = useCartContext();
  const formattedPrice = `₹${price}/kg`;
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!inStock) return;
    addItem({
      productId: id,
      name,
      price,
      image,
    });

    // Trigger toast
    useToastStore.getState().showToast(`Added ${name} to cart!`);

    // Trigger flying animation
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;

    const cartButton = document.getElementById("navbar-cart-btn");
    let endX = window.innerWidth - 80;
    let endY = 40;
    if (cartButton) {
      const cartRect = cartButton.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }

    const newItem: FlyingItem = {
      id: Date.now(),
      startX,
      startY,
      endX,
      endY,
      image,
    };
    setFlyingItems((prev) => [...prev, newItem]);

    if (onAddedToCart) {
      onAddedToCart(name, e, image);
    }
  };

  useEffect(() => {
    if (flyingItems.length > 0) {
      const timer = setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => Date.now() - item.id < 900));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [flyingItems]);

  return (
    <div className="group bg-white rounded-tl-[10px] rounded-tr-[50px] rounded-br-[10px] rounded-bl-[50px] shadow-soft overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-cream to-white overflow-hidden rounded-tl-[10px] rounded-tr-[50px] shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-accent text-3xl text-taupe/30">
              {name.charAt(0)}
            </span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-espresso">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 pt-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="mb-2 text-xs font-medium text-taupe">
            {categoryName || "Product"}
          </p>
          <h3 className="mb-3 font-heading text-xl font-bold leading-[1.25] text-espresso line-clamp-2 min-h-[3.2rem] flex items-center">
            {name}
          </h3>
          {description && (
            <p className="mb-6 line-clamp-2 text-sm leading-normal text-taupe">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 pt-2">
          <span className="text-burnt-orange font-bold text-xl shrink-0">
            {formattedPrice}
          </span>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            style={
              inStock
                ? { backgroundColor: "#D95B35", color: "#FFFFFF" }
                : undefined
            }
            className={`inline-flex h-12 min-w-[124px] items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-all duration-300 shrink-0 ${inStock
                ? "bg-burnt-orange text-white shadow-none ring-0 hover:bg-[#C44D2A] hover:shadow-[0_0_22px_rgba(217,91,53,0.55),0_12px_28px_rgba(61,43,31,0.18)]"
                : "bg-espresso/10 text-taupe cursor-not-allowed"
              }`}
          >
            {inStock ? (
              <>
                <ShoppingCart className="h-4 w-4" />
                Add
              </>
            ) : (
              "Unavailable"
            )}
          </button>
        </div>
      </div>

      {/* Flying Items animation container */}
      {flyingItems.map((item) => (
        <div
          key={item.id}
          className="fixed z-50 pointer-events-none w-10 h-10 rounded-full bg-burnt-orange border-2 border-white flex items-center justify-center text-white shadow-lg overflow-hidden"
          style={{
            left: item.startX - 20,
            top: item.startY - 20,
            animation: `fly-to-cart-${item.id} 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
          }}
        >
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <ShoppingCart className="w-5 h-5 text-white" />
          )}

          <style>{`
            @keyframes fly-to-cart-${item.id} {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              50% {
                opacity: 0.85;
              }
              100% {
                transform: translate(${item.endX - item.startX}px, ${item.endY - item.startY}px) scale(0.2);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
