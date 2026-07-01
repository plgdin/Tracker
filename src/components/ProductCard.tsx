import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "@/context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  categoryName: string | null;
  inStock: boolean | null;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  categoryName,
  inStock,
}: ProductCardProps) {
  const { addItem } = useCartContext();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!inStock) return;
    addItem({
      productId: id,
      name,
      price,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-cream to-white overflow-hidden">
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
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            added
              ? "bg-green-500 text-white scale-110"
              : "bg-white/90 backdrop-blur-sm text-espresso hover:bg-burnt-orange hover:text-white shadow-md opacity-0 group-hover:opacity-100"
          } ${!inStock ? "hidden" : ""}`}
        >
          {added ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-taupe uppercase tracking-wider mb-1">
          {categoryName || "Product"}
        </p>
        <h3 className="font-heading text-lg font-semibold text-espresso leading-tight mb-1">
          {name}
        </h3>
        {description && (
          <p className="text-xs text-taupe line-clamp-2 mb-3">{description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-burnt-orange font-bold text-lg">
            Rs.{price}
          </span>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              inStock
                ? "bg-espresso text-white hover:bg-burnt-orange"
                : "bg-espresso/10 text-taupe cursor-not-allowed"
            }`}
          >
            {inStock ? "Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
