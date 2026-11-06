import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {optional ? <span className="ml-1.5 font-normal text-subtle">optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs leading-relaxed text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn('field h-10', className)}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn('field min-h-24 resize-y leading-relaxed', className)}
      {...props}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn('field h-10 cursor-pointer pr-8', className)}
      {...props}
    >
      {children}
    </select>
  );
});

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  /** Renders the label for assistive technology only, for use inside dense grids. */
  hideLabel?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  hideLabel,
}: SwitchProps) {
  const generated = useId();
  const switchId = id ?? generated;

  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring relative mt-0.5 inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-out disabled:opacity-40',
        checked ? 'bg-accent' : 'bg-lineStrong',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white shadow-sm',
          'transition-transform duration-200 ease-out',
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );

  if (hideLabel) return control;

  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={switchId} className="cursor-pointer text-[13.5px] font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {control}
    </div>
  );
}
