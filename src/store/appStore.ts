import { create } from 'zustand';

export type StoreType = 'online' | 'offline';

interface AppState {
  storeType: StoreType;
  setStoreType: (type: StoreType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  storeType: 'offline', // Default for legacy/public paths until explicitly set
  setStoreType: (type) => set({ storeType: type }),
}));
