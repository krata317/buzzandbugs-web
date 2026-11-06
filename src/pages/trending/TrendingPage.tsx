import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSections } from '@/features/external/queries';
import { TRENDING_SECTIONS, sectionDescription, sectionLabel } from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { TrendingGrid } from '@/components/external/TrendingItem';

export function TrendingPage() {
  useDocumentTitle('Trending');
  const trending = useSections('trending');
  const offline = trending.isError && isNetworkError(trending.error);
  const sections = trending.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        serif
        eyebrow="Discover"
        title="Trending"
        description="Repositories, models, datasets, papers and podcasts that developers are paying attention to."
      />

      <SectionNav kind="trending" basePath="/trending" sections={TRENDING_SECTIONS} />

      {trending.isLoading ? (
        <div className="space-y-6">
          {[0, 1].map((section) => (
            <div key={section} className="space-y-3">
              <Skeleton className="h-3 w-28" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {trending.isError ? (
        <ErrorState
          title={offline ? 'Trending could not load' : 'Trending could not be fetched'}
          description={
            offline
              ? 'The API is not reachable. Start the backend and try again.'
              : 'The request failed. Trending sections are cached, so this is usually temporary.'
          }
          onRetry={() => void trending.refetch()}
          offline={offline}
        />
      ) : null}

      {trending.data && sections.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={22} />}
          title="Nothing cached yet"
          description="Trending is refreshed by the backend worker. Start it with npm run dev:worker, or force a refresh from the admin sources page."
        />
      ) : null}

      {sections.map((section) => (
        <section key={section.section} aria-labelledby={`trending-${section.section}`}>
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <div>
              <h2
                id={`trending-${section.section}`}
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                {sectionLabel('trending', section.section)}
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {sectionDescription('trending', section.section)}
              </p>
            </div>
            <Link
              to={`/trending/${section.section}`}
              className="focus-ring inline-flex shrink-0 items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-accent"
            >
              All {section.total}
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <TrendingGrid section={section.section} items={section.items} />
        </section>
      ))}
    </div>
  );
}
