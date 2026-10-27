import { create } from 'zustand';

export type StoreType = 'online' | 'offline';
export type ClientSegment = 'all' | 'hotel' | 'bakery';

interface AppState {
  storeType: StoreType;
  setStoreType: (type: StoreType) => void;
  clientSegment: ClientSegment;
  setClientSegment: (segment: ClientSegment) => void;
}

export const useAppStore = create<AppState>((set) => ({
  storeType: 'online', // Default for customer storefront
  setStoreType: (type) => set({ storeType: type }),
  clientSegment: 'all',
  setClientSegment: (segment) => set({ clientSegment: segment }),
}));
