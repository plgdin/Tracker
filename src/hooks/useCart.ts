import { useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image?: string | null;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        let newItems: CartItem[];
        if (existing) {
          newItems = prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        } else {
          newItems = [...prev, { ...item, quantity: 1 }];
        }
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => i.productId !== productId);
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) => {
        const newItems = prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items
    .reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
    .toFixed(2);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  };
}
