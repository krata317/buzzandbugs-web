import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSections } from '@/features/external/queries';
import { NEWS_SECTIONS, sectionLabel } from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { NewsLeadCard, NewsRow } from '@/components/external/NewsCard';

export function NewsPage() {
  useDocumentTitle('News');
  const news = useSections('news');
  const offline = news.isError && isNetworkError(news.error);
  const sections = news.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        serif
        eyebrow="Reading"
        title="News"
        description="Reporting from the publications that cover this industry best. Every headline opens at the original source."
      />

      <SectionNav kind="news" basePath="/news" sections={NEWS_SECTIONS} />

      {news.isLoading ? (
        <div className="space-y-8">
          {[0, 1].map((section) => (
            <div key={section} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {news.isError ? (
        <ErrorState
          title={offline ? 'News could not load' : 'News could not be fetched'}
          description={
            offline
              ? 'The connection was interrupted. Check your network and try again.'
              : 'The request failed. Try again in a moment.'
          }
          onRetry={() => void news.refetch()}
          offline={offline}
        />
      ) : null}

      {news.data && sections.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={22} />}
          title="Today's stories are on their way"
          description="Fresh reporting from across the technology press will appear here shortly."
        />
      ) : null}

      {sections.map((section) => (
        <section
          key={section.section}
          id={`section-${section.section}`}
          className="scroll-mt-24"
          aria-labelledby={`news-${section.section}`}
        >
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <h2
              id={`news-${section.section}`}
              className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink"
            >
              {sectionLabel('news', section.section)}
            </h2>
            <Link
              to={`/news/${section.section}`}
              className="focus-ring inline-flex shrink-0 items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-accent"
            >
              View more
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-2">
            {section.items.map((item) =>
              item.imageUrl ? (
                <NewsLeadCard key={item.id} item={item} />
              ) : (
                <NewsRow key={item.id} item={item} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
