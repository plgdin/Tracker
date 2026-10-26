import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastState {
  message: string | null;
  action: ToastAction | null;
  showToast: (message: string, action?: ToastAction | null, durationMs?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => {
  let activeTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    message: null,
    action: null,
    showToast: (message, action = null, durationMs = 3500) => {
      // Clear any existing timeouts to prevent overlapping hides
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }

      set({ message, action });

      // Auto-hide after specified duration (5-10s for undo toasts)
      activeTimeout = setTimeout(() => {
        set({ message: null, action: null });
        activeTimeout = null;
      }, durationMs);
    },
    hideToast: () => {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
        activeTimeout = null;
      }
      set({ message: null, action: null });
    },
  };
});
