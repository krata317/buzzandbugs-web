import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import type { ExternalItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import {
  formatDateRange,
  formatDayNumber,
  formatMonth,
  formatWeekday,
} from '@/lib/format';
import { platformLabel, stringListMeta, stringMeta } from '@/lib/sections';
import { Badge } from '@/components/ui/feedback';

export type EventStatus = 'ongoing' | 'upcoming' | 'undated';

export function eventStatus(item: ExternalItem, now = Date.now()): EventStatus {
  const start = item.startsAt ? new Date(item.startsAt).getTime() : null;
  const end = item.endsAt ? new Date(item.endsAt).getTime() : null;

  if (start === null) return 'undated';
  if (start <= now && (end === null || end > now)) return 'ongoing';
  if (start > now) return 'upcoming';
  return 'undated';
}

export function EventCard({ item, section }: { item: ExternalItem; section: string }) {
  const status = eventStatus(item);
  const platform = platformLabel(item.metadata?.platform) ?? stringMeta(item.metadata, 'platform');
  const organizers = stringListMeta(item.metadata, 'organizers');
  const format = stringMeta(item.metadata, 'format');

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'focus-ring group grid grid-cols-[56px_1fr] gap-4 rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft sm:grid-cols-[64px_1fr] sm:p-5',
        status === 'ongoing' && 'border-l-[3px] border-l-accent',
      )}
    >
      {item.startsAt ? (
        <div
          className={cn(
            'flex h-fit flex-col items-center rounded-lg border px-2 py-2',
            status === 'ongoing'
              ? 'border-accent/30 bg-accent/8 text-accent'
              : 'border-line bg-raised/60 text-ink',
          )}
        >
          <span className="font-mono text-[9px] uppercase leading-none tracking-[0.1em] opacity-70">
            {formatMonth(item.startsAt)}
          </span>
          <span className="mt-1 font-mono text-[19px] font-medium leading-none">
            {formatDayNumber(item.startsAt)}
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase leading-none tracking-[0.06em] opacity-70">
            {formatWeekday(item.startsAt)}
          </span>
        </div>
      ) : (
        <div className="flex h-fit flex-col items-center justify-center rounded-lg border border-dashed border-line bg-raised/40 px-2 py-3 text-subtle">
          <CalendarDays size={16} aria-hidden="true" />
          <span className="mt-1 font-mono text-[8px] uppercase leading-none tracking-[0.08em]">
            TBA
          </span>
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {status === 'ongoing' ? <Badge tone="accent">Ongoing</Badge> : null}
          {status === 'upcoming' ? <Badge tone="neutral">Upcoming</Badge> : null}
          {status === 'undated' ? <Badge tone="muted">Date unconfirmed</Badge> : null}
          {platform ? <Badge tone="muted">{platform}</Badge> : null}
          {format ? <Badge tone="muted">{format}</Badge> : null}
        </div>

        <h3 className="mt-1.5 text-[15.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {item.title}
        </h3>

        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-muted">
          <Clock size={11} className="text-subtle" aria-hidden="true" />
          {formatDateRange(item.startsAt, item.endsAt)}
        </p>

        {item.summary ? (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
            {item.summary}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
          {organizers.length > 0 ? <span className="truncate">{organizers.join(', ')}</span> : null}
          <span className="inline-flex items-center gap-1 transition-colors group-hover:text-accent">
            Source <ArrowUpRight size={10} aria-hidden="true" />
          </span>
          <span className="sr-only">Section: {section}</span>
        </div>
      </div>
    </a>
  );
}
