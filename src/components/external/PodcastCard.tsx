import { useState } from 'react';
import { ArrowUpRight, Clock3, Play } from 'lucide-react';
import type { ExternalItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatDate, formatDuration } from '@/lib/format';
import { numberMeta, stringMeta } from '@/lib/sections';

/**
 * Podcast episodes carry artwork, a publisher and a duration. Missing artwork falls back to
 * a neutral tile rather than a broken image.
 */
export function PodcastCard({ item }: { item: ExternalItem }) {
  const [failed, setFailed] = useState(false);
  const duration = formatDuration(numberMeta(item.metadata, 'durationSeconds'));
  const publisher = stringMeta(item.metadata, 'publisher') ?? item.author;
  const showArtwork = Boolean(item.imageUrl) && !failed;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'focus-ring group flex gap-3.5 rounded-lg border border-line bg-surface p-3.5',
        'transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft',
      )}
    >
      <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-md border border-line bg-raised">
        {showArtwork ? (
          <img
            src={item.imageUrl as string}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-accent">
            <Play size={18} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
          {publisher ?? 'Podcast'}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10.5px] text-subtle">
          {duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} aria-hidden="true" />
              {duration}
            </span>
          ) : null}
          {item.publishedAt ? <span>{formatDate(item.publishedAt)}</span> : null}
          <span className="inline-flex items-center gap-0.5 transition-colors group-hover:text-accent">
            Listen <ArrowUpRight size={9} aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
}

export function PodcastGrid({ items }: { items: ExternalItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((item) => (
        <PodcastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
