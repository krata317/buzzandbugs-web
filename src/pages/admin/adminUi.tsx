import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div>
        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger';
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface px-3.5 py-3',
        tone === 'warning' && 'border-amber-500/30 bg-amber-500/[0.06]',
        tone === 'danger' && 'border-danger/25 bg-danger/[0.05]',
      )}
    >
      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">{label}</p>
      <p className="mt-1 font-mono text-[22px] leading-none text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ health */

export type HealthState = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

const HEALTH_COPY: Record<HealthState, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

const HEALTH_STYLE: Record<HealthState, string> = {
  healthy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  degraded: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  unavailable: 'border-danger/30 bg-danger/10 text-danger',
  unknown: 'border-line bg-raised text-muted',
};

const HEALTH_DOT: Record<HealthState, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  unavailable: 'bg-danger',
  unknown: 'bg-lineStrong',
};

export function HealthPill({ state }: { state: HealthState }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        'font-mono text-[9.5px] uppercase tracking-[0.1em]',
        HEALTH_STYLE[state],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', HEALTH_DOT[state])} aria-hidden="true" />
      {HEALTH_COPY[state]}
    </span>
  );
}

/**
 * One card shape for every health indicator, so API, database, worker and moderation can be
 * compared at a glance instead of each having its own layout.
 */
export function HealthCard({
  label,
  state,
  primary,
  details,
}: {
  label: string;
  state: HealthState;
  primary: ReactNode;
  details?: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <section className="flex h-full flex-col rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">{label}</p>
        <HealthPill state={state} />
      </div>

      <div className="mt-2.5 text-[13.5px] font-medium leading-snug text-ink">{primary}</div>

      {details && details.length > 0 ? (
        <dl className="mt-auto space-y-1 pt-3">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-subtle">
                {detail.label}
              </dt>
              <dd className="truncate font-mono text-[10.5px] text-muted">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function StatusDot({ status }: { status: string }) {
  const state: HealthState =
    status === 'up' || status === 'ok' || status === 'healthy'
      ? 'healthy'
      : status === 'down' || status === 'failed'
        ? 'unavailable'
        : 'unknown';

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
      <span className={cn('h-1.5 w-1.5 rounded-full', HEALTH_DOT[state])} aria-hidden="true" />
      {status}
    </span>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[560px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-line px-3 py-2 font-mono text-[9.5px] font-normal uppercase tracking-[0.1em] text-subtle',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('border-b border-line px-3 py-2.5 align-middle text-[12.5px] text-ink', className)}>
      {children}
    </td>
  );
}
