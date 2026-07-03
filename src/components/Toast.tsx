import { useEffect, useState } from 'react';
import { useToastStore } from '../store/toastStore';
import { Sparkles } from 'lucide-react';

export default function Toast() {
  const { message, hideToast } = useToastStore();
  const [animId, setAnimId] = useState(0);

  useEffect(() => {
    if (message) {
      setAnimId(prev => prev + 1);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div 
      className="toast-pill-wrapper" 
      onClick={hideToast}
      style={{
        animation: `toast-slide-up-down-${animId} 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards`
      }}
    >
      <div className="toast-pill">
        <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
        <span>{message}</span>
      </div>

      <style>{`
        @keyframes toast-slide-up-down-${animId} {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          10% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          85% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
