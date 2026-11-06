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
        description="Reporting from the feeds that cover this industry best. Every headline opens at the original publisher."
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
              ? 'The API is not reachable. Start the backend and try again.'
              : 'The request failed. External sections are served from a cache, so this is usually temporary.'
          }
          onRetry={() => void news.refetch()}
          offline={offline}
        />
      ) : null}

      {news.data && sections.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={22} />}
          title="No articles cached yet"
          description="News is refreshed by the backend worker. Start the worker (npm run dev:worker) or force a refresh from the admin sources page."
        />
      ) : null}

      {sections.map((section, index) => {
        const [lead, ...rest] = section.items;
        if (!lead) return null;

        return (
          <section key={section.section} aria-labelledby={`news-${section.section}`}>
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
                All {section.total}
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>

            <div className={index === 0 ? 'space-y-1' : 'space-y-0.5'}>
              <NewsLeadCard item={lead} />
              {rest.map((item) => (
                <NewsRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
