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
              ? 'The connection was interrupted. Check your network and try again.'
              : 'The request failed. Try again in a moment.'
          }
          onRetry={() => void items.refetch()}
          offline={offline}
        />
      ) : null}

      {items.data && all.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={22} />}
          title="No stories in this section yet"
          description="New reporting will appear here as it is published."
        />
      ) : null}

      {all.length > 0 ? (
        <div className="space-y-2">
          {all.map((item) =>
            item.imageUrl ? (
              <NewsLeadCard key={item.id} item={item} />
            ) : (
              <NewsRow key={item.id} item={item} />
            ),
          )}
        </div>
      ) : null}

      {items.hasNextPage ? (
        <LoadMore
          onClick={() => void items.fetchNextPage()}
          loading={items.isFetchingNextPage}
          label="Load more stories"
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
