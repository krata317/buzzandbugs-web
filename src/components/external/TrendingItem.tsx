import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Download, Heart, Play, Star } from 'lucide-react';
import type { ExternalItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { formatCount, formatDate, hostOf } from '@/lib/format';
import { numberMeta, stringListMeta, stringMeta } from '@/lib/sections';

function Stat({ icon: Icon, value }: { icon: typeof Star; value: number | null }) {
  if (value === null) return null;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-subtle">
      <Icon size={11} aria-hidden="true" />
      {formatCount(value)}
    </span>
  );
}

function Topic({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-line px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-subtle">
      {children}
    </span>
  );
}

function Shell({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        'focus-ring group block rounded-lg border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft',
        className,
      )}
    >
      {children}
    </a>
  );
}

function RepositoryCard({ item }: { item: ExternalItem }) {
  const stars = numberMeta(item.metadata, 'stars');
  const owner = stringMeta(item.metadata, 'owner');
  const name = stringMeta(item.metadata, 'name') ?? item.title;
  const language = stringMeta(item.metadata, 'language');
  const topics = stringListMeta(item.metadata, 'topics').slice(0, 3);

  return (
    <Shell href={item.url}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-subtle">{owner ?? hostOf(item.url)}</p>
          <h3 className="mt-0.5 truncate text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
            {name}
          </h3>
        </div>
        <ArrowUpRight
          size={14}
          className="mt-1 shrink-0 text-subtle transition-colors group-hover:text-accent"
          aria-hidden="true"
        />
      </div>

      {item.summary ? (
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{item.summary}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <Stat icon={Star} value={stars} />
        {language ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden="true" />
            {language}
          </span>
        ) : null}
        {topics.map((topic) => (
          <Topic key={topic}>{topic}</Topic>
        ))}
      </div>
    </Shell>
  );
}

function ModelCard({ item }: { item: ExternalItem }) {
  const likes = numberMeta(item.metadata, 'likes');
  const downloads = numberMeta(item.metadata, 'downloads');
  const pipeline = stringMeta(item.metadata, 'pipelineTag');
  const tags = stringListMeta(item.metadata, 'tags').slice(0, 3);

  return (
    <Shell href={item.url}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-[13px] font-medium text-ink transition-colors group-hover:text-accent">
            {item.title}
          </h3>
          {item.author ? (
            <p className="mt-0.5 truncate text-[11.5px] text-subtle">{item.author}</p>
          ) : null}
        </div>
        <Stat icon={Heart} value={likes} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {pipeline ? <Topic>{pipeline.replace(/-/g, ' ')}</Topic> : null}
        {downloads !== null ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-subtle">
            <Download size={10} aria-hidden="true" /> {formatCount(downloads)}
          </span>
        ) : null}
        {tags.map((tag) => (
          <Topic key={tag}>{tag}</Topic>
        ))}
      </div>
    </Shell>
  );
}

function DatasetCard({ item }: { item: ExternalItem }) {
  const downloads = numberMeta(item.metadata, 'downloads');
  const likes = numberMeta(item.metadata, 'likes');
  const tags = stringListMeta(item.metadata, 'tags').slice(0, 3);

  return (
    <Shell href={item.url}>
      <h3 className="truncate font-mono text-[13px] font-medium text-ink transition-colors group-hover:text-accent">
        {item.title}
      </h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
        {item.author ? <span className="text-[11.5px] text-subtle">{item.author}</span> : null}
        <Stat icon={Download} value={downloads} />
        <Stat icon={Heart} value={likes} />
      </div>
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Topic key={tag}>{tag}</Topic>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}

function PaperCard({ item }: { item: ExternalItem }) {
  const authors = stringListMeta(item.metadata, 'authors');

  return (
    <Shell href={item.url}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
          {item.publishedAt ? formatDate(item.publishedAt) : ''}
        </span>
      </div>
      {authors.length > 0 ? (
        <p className="mt-1.5 line-clamp-1 text-[11.5px] text-subtle">{authors.join(', ')}</p>
      ) : item.author ? (
        <p className="mt-1.5 text-[11.5px] text-subtle">{item.author}</p>
      ) : null}
      {item.summary ? (
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{item.summary}</p>
      ) : null}
    </Shell>
  );
}

function VideoCard({ item }: { item: ExternalItem }) {
  const [failed, setFailed] = useState(false);
  const views = numberMeta(item.metadata, 'views');

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group block overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft"
    >
      {item.imageUrl && !failed ? (
        <div className="relative aspect-video w-full overflow-hidden bg-raised">
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-white">
            YouTube
          </span>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-raised">
          <Play size={20} className="text-subtle" aria-hidden="true" />
        </div>
      )}
      <div className="p-3.5">
        <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {item.title}
        </h3>
        <p className="mt-1 truncate font-mono text-[10.5px] text-subtle">
          {item.author ?? 'YouTube'}
          {views !== null ? ` · ${formatCount(views)} views` : ''}
        </p>
      </div>
    </a>
  );
}

export function TrendingItem({
  item,
  section,
}: {
  item: ExternalItem;
  section: string;
}) {
  switch (section) {
    case 'repositories':
      return <RepositoryCard item={item} />;
    case 'models':
      return <ModelCard item={item} />;
    case 'datasets':
      return <DatasetCard item={item} />;
    case 'papers':
      return <PaperCard item={item} />;
    case 'youtube':
      return <VideoCard item={item} />;
    default:
      return (
        <Shell href={item.url}>
          <h3 className="text-[14px] font-medium text-ink">{item.title}</h3>
          <p className="mt-1 text-[12px] text-muted">{item.summary}</p>
        </Shell>
      );
  }
}

export function TrendingGrid({
  section,
  items,
}: {
  section: string;
  items: ExternalItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <TrendingItem key={item.id} item={item} section={section} />
      ))}
    </div>
  );
}
