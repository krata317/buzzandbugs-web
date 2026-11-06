import type { ReactNode } from 'react';
import { AlertTriangle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-muted', className)}
      aria-hidden="true"
    />
  );
}

export function LoadingBlock({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-14 text-sm text-muted" role="status">
      <Spinner />
      <span>{label}…</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function PostSkeleton() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-raised text-muted',
  accent: 'border-accent/25 bg-accent/10 text-accent',
  success: 'border-up/25 bg-up/10 text-up',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  muted: 'border-transparent bg-transparent text-subtle',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-[0.08em]',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line text-center',
        compact ? 'px-5 py-10' : 'px-6 py-16',
      )}
    >
      {icon ? <div className="mb-3 text-subtle">{icon}</div> : null}
      <p className="text-[14.5px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  offline?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  offline,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-14 text-center">
      <div className="mb-3 text-subtle">
        {offline ? <WifiOff size={22} /> : <AlertTriangle size={22} />}
      </div>
      <p className="text-[14.5px] font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          iconLeft={<RefreshCw size={13} />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger/5 px-3 py-2 text-[12.5px] leading-relaxed text-danger"
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
