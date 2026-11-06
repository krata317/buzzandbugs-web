import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mic } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSectionItems } from '@/features/external/queries';
import {
  PODCAST_SECTIONS,
  isPodcastSection,
  sectionDescription,
  sectionLabel,
} from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader, LoadMore } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { PodcastGrid } from '@/components/external/PodcastCard';

export function PodcastsSectionPage() {
  const { section = '' } = useParams();
  const valid = isPodcastSection(section);
  const items = useSectionItems('podcasts', section, 12);

  useDocumentTitle(valid ? sectionLabel('podcasts', section) : 'Podcasts');

  if (!valid) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={<Mic size={22} />}
          title="Unknown podcast"
          description="That show is not part of the podcast collection."
          action={
            <Link to="/podcasts" className="text-[13px] text-accent underline underline-offset-2">
              Back to Podcasts
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
        title={sectionLabel('podcasts', section)}
        description={sectionDescription('podcasts', section)}
      />

      <SectionNav kind="podcasts" basePath="/podcasts" sections={PODCAST_SECTIONS} />

      {items.isLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-[104px] w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {items.isError ? (
        <ErrorState
          title={offline ? 'Episodes could not load' : 'Episodes could not be fetched'}
          description={
            offline
              ? 'The connection was interrupted. Check your network and try again.'
              : 'The request failed. Try again in a moment.'
          }
          onRetry={() => void items.refetch()}
          offline={offline}
        />
      ) : null}

      {items.data && all.length === 0 ? (
        <EmptyState
          icon={<Mic size={22} />}
          title="No episodes yet"
          description="New episodes from this show will appear here as they are published."
        />
      ) : null}

      {all.length > 0 ? <PodcastGrid items={all} /> : null}

      {items.hasNextPage ? (
        <LoadMore
          onClick={() => void items.fetchNextPage()}
          loading={items.isFetchingNextPage}
          label="Load more episodes"
        />
      ) : null}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/podcasts"
      className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      All podcasts
    </Link>
  );
}
