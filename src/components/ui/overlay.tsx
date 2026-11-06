import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from './Button';

/* ------------------------------------------------------------------ dialog */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className={cn(
        'w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-0 text-ink shadow-lift',
        'open:animate-scale-in',
        MODAL_SIZES[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 id="modal-title" className="text-[15px] font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>
        <IconButton label="Close dialog" size="sm" onClick={onClose}>
          <X size={15} />
        </IconButton>
      </div>
      {children ? <div className="px-5 py-4">{children}</div> : null}
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-line bg-raised/50 px-5 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}

/* -------------------------------------------------------------------- menu */

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}

interface MenuProps {
  trigger: ReactNode;
  triggerLabel: string;
  items: MenuItem[];
  align?: 'start' | 'end';
}

export function Menu({ trigger, triggerLabel, items, align = 'end' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);

    const first = panelRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]');
    first?.focus();

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    if (buttons.length === 0) return;
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(index + 1) % buttons.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      buttons[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-raised hover:text-ink"
      >
        {trigger}
      </button>
      {open ? (
        <div
          ref={panelRef}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={onPanelKeyDown}
          className={cn(
            'absolute z-40 mt-1 min-w-[168px] animate-scale-in overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lift',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors',
                'disabled:pointer-events-none disabled:opacity-40',
                item.tone === 'danger'
                  ? 'text-danger hover:bg-danger/10'
                  : 'text-ink hover:bg-raised',
              )}
            >
              {item.icon ? <span className="text-current opacity-80">{item.icon}</span> : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- mobile sheet */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs animate-slide-up flex-col border-r border-line bg-canvas">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {title}
          </span>
          <IconButton label="Close menu" size="sm" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
