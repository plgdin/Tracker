import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";

export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  image?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isLoading } = useAuthStore();

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem("cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.productId !== productId);
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
      return;
    }
    setItems((prev) => {
      const newItems = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      localStorage.setItem("cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items
    .reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
    .toFixed(2);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartContext must be used within CartProvider");
  return context;
}
