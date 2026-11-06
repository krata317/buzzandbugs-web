import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSectionItems } from '@/features/external/queries';
import {
  NEWS_SECTIONS,
  isNewsSection,
  sectionDescription,
  sectionLabel,
} from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader, LoadMore } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { NewsLeadCard, NewsRow } from '@/components/external/NewsCard';

export function NewsSectionPage() {
  const { section = '' } = useParams();
  const valid = isNewsSection(section);
  const items = useSectionItems('news', section, 12);

  useDocumentTitle(valid ? sectionLabel('news', section) : 'News');

  if (!valid) {
    return (
      <div className="space-y-4">
        <BackLink />
        <EmptyState
          icon={<Newspaper size={22} />}
          title="Unknown news section"
          description="That section does not exist. Pick one from the list instead."
          action={
            <Link to="/news" className="text-[13px] text-accent underline underline-offset-2">
              Back to News
            </Link>
          }
        />
      </div>
    );
  }

  const all = items.data?.pages.flatMap((page) => page.items) ?? [];
  const offline = items.isError && isNetworkError(items.error);
  const [lead, ...rest] = all;

  return (
    <div className="space-y-5">
      <BackLink />

      <PageHeader
        serif
        title={sectionLabel('news', section)}
        description={sectionDescription('news', section)}
      />

      <SectionNav kind="news" basePath="/news" sections={NEWS_SECTIONS} />

      {items.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-56 w-full rounded-xl" />
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
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
          icon={<Newspaper size={22} />}
          title="Nothing cached for this section"
          description="The worker refreshes this section on a schedule. If it stays empty, the upstream feed may be unavailable."
        />
      ) : null}

      {lead ? (
        <div>
          <NewsLeadCard item={lead} />
          <div className="mt-1 divide-y divide-line">
            {rest.map((item) => (
              <NewsRow key={item.id} item={item} />
            ))}
          </div>
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
      to="/news"
      className="focus-ring inline-flex items-center gap-1.5 rounded-md text-[12.5px] text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={13} aria-hidden="true" />
      All news
    </Link>
  );
}
