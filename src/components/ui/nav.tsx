import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './feedback';
import { Button } from './Button';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5 rounded-lg bg-raised p-0.5', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-ring inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-[13px] font-medium transition-all duration-150',
              active ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && option.count > 0 ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none',
                  active ? 'bg-accent/10 text-accent' : 'bg-line text-subtle',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  serif?: boolean;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  serif,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4 pb-5', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="meta mb-2">{eyebrow}</p> : null}
        <h1
          className={cn(
            'tracking-[-0.02em] text-ink',
            serif
              ? 'font-serif text-[34px] leading-[1.05] sm:text-[40px]'
              : 'text-[24px] font-semibold leading-tight sm:text-[27px]',
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

interface LoadMoreProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export function LoadMore({ onClick, loading, label = 'Load more' }: LoadMoreProps) {
  return (
    <div className="flex justify-center pt-2">
      <Button variant="secondary" size="sm" onClick={onClick} disabled={loading}>
        {loading ? (
          <>
            <Spinner size={13} /> Loading
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
