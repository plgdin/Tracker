import { useToastStore } from '../store/toastStore';
import { Sparkles } from 'lucide-react';

export default function Toast() {
  const { message, hideToast } = useToastStore();

  if (!message) return null;

  return (
    <div className="toast-pill-wrapper" onClick={hideToast}>
      <div className="toast-pill">
        <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
        <span>{message}</span>
      </div>
    </div>
  );
}
