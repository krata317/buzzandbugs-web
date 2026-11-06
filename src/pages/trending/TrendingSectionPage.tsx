import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSectionItems } from '@/features/external/queries';
import {
  TRENDING_SECTIONS,
  isTrendingSection,
  sectionDescription,
  sectionLabel,
} from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader, LoadMore } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { TrendingGrid } from '@/components/external/TrendingItem';

export function TrendingSectionPage() {
  const { section = '' } = useParams();
  const valid = isTrendingSection(section);
  const items = useSectionItems('trending', section, 12);

  useDocumentTitle(valid ? sectionLabel('trending', section) : 'Trending');

  if (!valid) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={<TrendingUp size={22} />}
          title="Unknown trending section"
          description="That section does not exist."
          action={
            <Link to="/trending" className="text-[13px] text-accent underline underline-offset-2">
              Back to Trending
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
        title={sectionLabel('trending', section)}
        description={sectionDescription('trending', section)}
      />

      <SectionNav kind="trending" basePath="/trending" sections={TRENDING_SECTIONS} />

      {items.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {items.isError ? (
        <ErrorState
          title={offline ? 'This section could not load' : 'This section could not be fetched'}
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
          icon={<TrendingUp size={22} />}
          title="Nothing cached for this section"
          description="The worker refreshes this section on a schedule. YouTube also requires a YOUTUBE_API_KEY on the backend."
        />
      ) : null}

      {all.length > 0 ? <TrendingGrid section={section} items={all} /> : null}

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
      to="/trending"
      className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      All trending
    </Link>
  );
}
