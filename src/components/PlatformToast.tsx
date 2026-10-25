import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { Platform } from '../ui/types';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  platform: Platform;
  toast: ToastState | null;
  onDismiss: () => void;
}

export function PlatformToast({ platform, toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertTriangle : Info;

  return (
    <div className={`toast toast-${platform} is-${toast.tone}`} role="status" aria-live="polite">
      <Icon aria-hidden="true" />
      <p>{toast.message}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
