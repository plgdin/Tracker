import { useState } from 'react';
import { useToastStore } from '../store/toastStore';
import { Sparkles, X } from 'lucide-react';

export default function Toast() {
  const { message, action, hideToast } = useToastStore();
  const [animId, setAnimId] = useState(0);

  const [prevMessage, setPrevMessage] = useState(message);
  if (message !== prevMessage) {
    setPrevMessage(message);
    if (message) {
      setAnimId((prev) => prev + 1);
    }
  }

  if (!message) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className="toast-pill-wrapper"
      style={{
        animation: `toast-slide-up-down-${animId} 6.5s cubic-bezier(0.25, 1, 0.5, 1) forwards`
      }}
    >
      <div className="toast-pill !bg-[#361B0E] !text-[#F9F4EE] !border-[#E8D8CC] !py-2.5 !px-4 shadow-2xl flex items-center gap-2.5 rounded-full">
        <Sparkles size={16} className="text-[#EAD9CF] shrink-0" />
        <span className="text-xs sm:text-sm font-medium pr-1">{message}</span>
        
        {action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              hideToast();
            }}
            className="px-3 py-1 bg-[#EAD9CF] hover:bg-white text-[#361B0E] font-bold text-xs rounded-full transition-all active:scale-95 shadow-xs"
          >
            {action.label}
          </button>
        )}

        <button
          type="button"
          onClick={hideToast}
          className="text-[#EAD9CF]/60 hover:text-white p-1 rounded-full transition-colors ml-1"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes toast-slide-up-down-${animId} {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          6% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          92% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .toast-pill-wrapper {
            animation: none !important;
            transform: translateX(-50%) translateY(0) !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
