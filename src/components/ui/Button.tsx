import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accentInk shadow-soft hover:opacity-90 active:opacity-95 disabled:opacity-50',
  secondary:
    'border border-line bg-surface text-ink hover:border-lineStrong hover:bg-raised disabled:opacity-50',
  outline:
    'border border-accent/35 bg-transparent text-accent hover:bg-accent/10 disabled:opacity-50',
  ghost: 'text-muted hover:bg-raised hover:text-ink disabled:opacity-40',
  danger:
    'bg-danger text-dangerInk hover:opacity-90 active:opacity-95 disabled:opacity-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-[13px]',
  md: 'h-9 gap-2 rounded-md px-3.5 text-[13.5px]',
  lg: 'h-11 gap-2 rounded-lg px-5 text-sm',
};

export function buttonStyles(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  const { variant = 'secondary', size = 'md', fullWidth, className } = options;
  return cn(
    'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
    'transition-[background-color,border-color,color,opacity,box-shadow] duration-150 ease-out',
    'disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    iconLeft,
    iconRight,
    fullWidth,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 16 : 14} className="animate-spin" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  size?: 'sm' | 'md';
  active?: boolean;
}

const ICON_VARIANTS = {
  ghost: 'text-muted hover:bg-raised hover:text-ink',
  secondary: 'border border-line bg-surface text-muted hover:border-lineStrong hover:text-ink',
  primary: 'bg-accent text-accentInk hover:opacity-90',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = 'ghost', size = 'md', active, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      data-active={active || undefined}
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-md transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
        active ? 'bg-accent/10 text-accent' : ICON_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
