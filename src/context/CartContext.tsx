/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image?: string | null;
  gstPercentage?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: string;
  totalGst: string;
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

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
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
  
  // Calculate Base Total and GST Total
  const { subTotal, gstTotal } = items.reduce((acc, i) => {
    // Parse price safely, removing /kg or non-numeric chars
    const numericPrice = parseFloat(i.price.replace(/[^0-9.]/g, '')) || 0;
    const itemTotal = numericPrice * i.quantity;
    const gstPercent = i.gstPercentage || 0;
    const itemGst = itemTotal * (gstPercent / 100);
    
    return {
      subTotal: acc.subTotal + itemTotal,
      gstTotal: acc.gstTotal + itemGst
    };
  }, { subTotal: 0, gstTotal: 0 });

  const totalAmount = (subTotal + gstTotal).toFixed(2);
  const totalGst = gstTotal.toFixed(2);

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
        totalGst,
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
