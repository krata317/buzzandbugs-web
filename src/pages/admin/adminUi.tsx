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

export function StatusDot({ status }: { status: string }) {
  const tone =
    status === 'up' || status === 'ok' || status === 'healthy'
      ? 'bg-emerald-500'
      : status === 'down' || status === 'failed'
        ? 'bg-danger'
        : 'bg-amber-500';

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
      <span className={cn('h-1.5 w-1.5 rounded-full', tone)} aria-hidden="true" />
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
