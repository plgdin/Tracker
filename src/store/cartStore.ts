import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  max_quantity?: number; // Stock count
}

interface CartStore {
  cart: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      isCheckoutOpen: false,

      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      setIsCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),

      addItem: (item) => set((state) => {
        const existingItem = state.cart.find((i) => i.id === item.id);
        if (existingItem) {
          const newQty = existingItem.quantity + item.quantity;
          return {
            cart: state.cart.map((i) =>
              i.id === item.id 
                ? { ...i, quantity: item.max_quantity && newQty > item.max_quantity ? item.max_quantity : newQty } 
                : i
            ),
          };
        }
        return { cart: [...state.cart, item] };
      }),

      removeItem: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter((i) => i.id !== id) };
        }
        return {
          cart: state.cart.map((i) => {
            if (i.id === id) {
              return { ...i, quantity: i.max_quantity && quantity > i.max_quantity ? i.max_quantity : quantity };
            }
            return i;
          }),
        };
      }),

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => get().cart.reduce((total, item) => total + item.quantity, 0),
      
      getTotalAmount: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'tracker-cart-storage',
    }
  )
);
