import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSectionItems } from '@/features/external/queries';
import {
  EVENT_SECTIONS,
  isEventSection,
  sectionDescription,
  sectionLabel,
} from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader, LoadMore } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { EventCard } from '@/components/external/EventCard';

export function EventsSectionPage() {
  const { section = '' } = useParams();
  const valid = isEventSection(section);
  const items = useSectionItems('events', section, 12);

  useDocumentTitle(valid ? sectionLabel('events', section) : 'Events');

  if (!valid) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="Unknown event category"
          description="That category does not exist."
          action={
            <Link to="/events" className="text-[13px] text-accent underline underline-offset-2">
              Back to Events
            </Link>
          }
        />
      </div>
    );
  }

  const all = items.data?.pages.flatMap((page) => page.items) ?? [];
  const offline = items.isError && isNetworkError(items.error);

  return (
    <div className="space-y-5">
      <BackLink />

      <PageHeader
        serif
        title={sectionLabel('events', section)}
        description={sectionDescription('events', section)}
      />

      <SectionNav kind="events" basePath="/events" sections={EVENT_SECTIONS} />

      {items.isLoading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {items.isError ? (
        <ErrorState
          title={offline ? 'This category could not load' : 'This category could not be fetched'}
          description={
            offline
              ? 'The API is not reachable. Start the backend and try again.'
              : 'The request failed. Try again in a moment.'
          }
          onRetry={() => void items.refetch()}
          offline={offline}
        />
      ) : null}

      {items.data && all.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="No events in this category"
          description="Nothing upcoming is cached. The worker refreshes this category on a schedule."
        />
      ) : null}

      {all.length > 0 ? (
        <div className="space-y-2.5">
          {all.map((item) => (
            <EventCard key={item.id} item={item} section={section} />
          ))}
        </div>
      ) : null}

      {items.hasNextPage ? (
        <LoadMore
          onClick={() => void items.fetchNextPage()}
          loading={items.isFetchingNextPage}
          label="Show more"
        />
      ) : null}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/events"
      className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      All events
    </Link>
  );
}
