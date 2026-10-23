import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success:
    'border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 dark:bg-emerald-500/15',
  error:
    'border-rose-500/30 bg-rose-500/15 text-rose-800 dark:text-rose-200 dark:bg-rose-500/15',
  info: 'border-sky-500/30 bg-sky-500/15 text-sky-800 dark:text-sky-200 dark:bg-sky-500/15',
};

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const Icon =
    toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertTriangle : Info;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`animate-rise pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${TONE_STYLES[toast.tone]}`}
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
