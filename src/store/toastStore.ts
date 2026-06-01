import { create } from 'zustand';

interface ToastState {
  message: string | null;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => {
  let activeTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    message: null,
    showToast: (message) => {
      // Clear any existing timeouts to prevent overlapping hides
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }

      set({ message });

      // Auto-hide after 3 seconds
      activeTimeout = setTimeout(() => {
        set({ message: null });
        activeTimeout = null;
      }, 3000);
    },
    hideToast: () => {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
      set({ message: null });
    }
  };
});
