import { create } from 'zustand';

export type StoreType = 'online' | 'offline';

interface AppState {
  storeType: StoreType;
  setStoreType: (type: StoreType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  storeType: 'online', // Default for customer storefront
  setStoreType: (type) => set({ storeType: type }),
}));
