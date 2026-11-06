import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSections } from '@/features/external/queries';
import { EVENT_SECTIONS, sectionDescription, sectionLabel } from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { EventCard, eventStatus } from '@/components/external/EventCard';

export function EventsPage() {
  useDocumentTitle('Events');
  const events = useSections('events');
  const offline = events.isError && isNetworkError(events.error);
  const sections = events.data ?? [];

  const ongoingCount = sections
    .flatMap((section) => section.items)
    .filter((item) => eventStatus(item) === 'ongoing').length;

  return (
    <div className="space-y-6">
      <PageHeader
        serif
        eyebrow="Calendar"
        title="Events"
        description="Hackathons, rated contests and security competitions. Times are shown in your local timezone."
        actions={
          ongoingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11.5px] font-medium text-accent">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" />
              {ongoingCount} happening now
            </span>
          ) : null
        }
      />

      <SectionNav kind="events" basePath="/events" sections={EVENT_SECTIONS} />

      {events.isLoading ? (
        <div className="space-y-6">
          {[0, 1].map((section) => (
            <div key={section} className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : null}

      {events.isError ? (
        <ErrorState
          title={offline ? 'Events could not load' : 'Events could not be fetched'}
          description={
            offline
              ? 'The API is not reachable. Start the backend and try again.'
              : 'The request failed. Events are cached by the worker, so this is usually temporary.'
          }
          onRetry={() => void events.refetch()}
          offline={offline}
        />
      ) : null}

      {events.data && sections.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="No events cached yet"
          description="The worker pulls hackathons, contests and CTF listings on a schedule. Start it with npm run dev:worker to populate this page."
        />
      ) : null}

      {sections.map((section) => (
        <section key={section.section} aria-labelledby={`events-${section.section}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <div>
              <h2
                id={`events-${section.section}`}
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                {sectionLabel('events', section.section)}
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {sectionDescription('events', section.section)}
              </p>
            </div>
            <Link
              to={`/events/${section.section}`}
              className="focus-ring inline-flex shrink-0 items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-accent"
            >
              All {section.total}
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {section.items.map((item) => (
              <EventCard key={item.id} item={item} section={section.section} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
