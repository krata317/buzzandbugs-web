import { Link } from 'react-router-dom';
import { ArrowRight, Mic } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSections } from '@/features/external/queries';
import { PODCAST_SECTIONS, sectionDescription, sectionLabel } from '@/lib/sections';
import { isNetworkError } from '@/lib/api';
import { PageHeader } from '@/components/ui/nav';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { SectionNav } from '@/components/external/SectionNav';
import { PodcastGrid } from '@/components/external/PodcastCard';

export function PodcastsPage() {
  useDocumentTitle('Podcasts');
  const podcasts = useSections('podcasts');
  const offline = podcasts.isError && isNetworkError(podcasts.error);
  const sections = podcasts.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        serif
        eyebrow="Listen"
        title="Podcasts"
        description="Episodes from five shows that explain how software actually gets built, shipped and maintained."
      />

      <SectionNav kind="podcasts" basePath="/podcasts" sections={PODCAST_SECTIONS} />

      {podcasts.isLoading ? (
        <div className="space-y-6">
          {[0, 1].map((section) => (
            <div key={section} className="space-y-3">
              <Skeleton className="h-3 w-32" />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Skeleton className="h-[104px] w-full rounded-lg" />
                <Skeleton className="h-[104px] w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {podcasts.isError ? (
        <ErrorState
          title={offline ? 'Podcasts could not load' : 'Podcasts could not be fetched'}
          description={
            offline
              ? 'The connection was interrupted. Check your network and try again.'
              : 'The request failed. Try again in a moment.'
          }
          onRetry={() => void podcasts.refetch()}
          offline={offline}
        />
      ) : null}

      {podcasts.data && sections.length === 0 ? (
        <EmptyState
          icon={<Mic size={22} />}
          title="New episodes are on the way"
          description="Fresh episodes from The Changelog, freeCodeCamp, Software Engineering Daily, InfoQ and Syntax will appear here."
        />
      ) : null}

      {sections.map((section) => (
        <section
          key={section.section}
          id={`section-${section.section}`}
          className="scroll-mt-24"
          aria-labelledby={`podcasts-${section.section}`}
        >
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <div>
              <h2
                id={`podcasts-${section.section}`}
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                {sectionLabel('podcasts', section.section)}
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {sectionDescription('podcasts', section.section)}
              </p>
            </div>
            <Link
              to={`/podcasts/${section.section}`}
              className="focus-ring inline-flex shrink-0 items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-accent"
            >
              View more
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>

          <PodcastGrid items={section.items} />
        </section>
      ))}
    </div>
  );
}
