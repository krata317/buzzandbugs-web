import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  push: (toast: { title: string; description?: string; tone?: ToastTone }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_ICON = {
  success: Check,
  error: AlertCircle,
  info: Info,
} as const;

const TONE_STYLE: Record<ToastTone, string> = {
  success: 'text-up',
  error: 'text-down',
  info: 'text-accent',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastApi['push']>(
    ({ title, description, tone = 'info' }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current.slice(-2), { id, title, description, tone }]);
      const timeout = window.setTimeout(() => dismiss(id), tone === 'error' ? 8000 : 5000);
      timers.current.set(id, timeout);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
      >
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-lift"
            >
              <span className={cn('mt-0.5 shrink-0', TONE_STYLE[toast.tone])}>
                <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium leading-snug text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="focus-ring -m-1 shrink-0 rounded p-1 text-subtle transition-colors hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
