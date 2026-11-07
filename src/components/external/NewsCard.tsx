import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ExternalItem } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { cleanText, hostOf } from '@/lib/format';

function Thumbnail({ src, className }: { src: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex min-w-0 items-center justify-center rounded-md border border-line bg-raised',
          className,
        )}
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-subtle">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('min-w-0 rounded-md border border-line bg-raised object-cover', className)}
    />
  );
}

function Meta({ item }: { item: ExternalItem }) {
  const host = hostOf(item.url);
  const author = cleanText(item.author);
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
      {author ? <span className="max-w-[180px] truncate">{author}</span> : null}
      {author && host ? <span aria-hidden="true">·</span> : null}
      {host ? <span className="truncate">{host}</span> : null}
    </div>
  );
}

export function NewsLeadCard({ item }: { item: ExternalItem }) {
  const summary = cleanText(item.summary);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group grid grid-cols-1 gap-4 rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:p-5"
    >
      <div className="order-2 flex min-w-0 flex-col justify-between sm:order-1">
        <div className="min-w-0">
          <Meta item={item} />
          <h3 className="mt-2 break-words font-serif text-[24px] leading-[1.15] tracking-[-0.01em] text-ink transition-colors group-hover:text-accent sm:text-[27px]">
            {cleanText(item.title)}
          </h3>
          {summary ? (
            <p className="mt-2 line-clamp-3 break-words text-[13.5px] leading-relaxed text-muted [overflow-wrap:anywhere]">
              {summary}
            </p>
          ) : null}
        </div>
        <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
          Read at source <ArrowUpRight size={11} aria-hidden="true" />
        </span>
      </div>
      <Thumbnail
        src={item.imageUrl}
        className="order-1 aspect-[16/10] w-full sm:order-2 sm:h-full"
      />
    </a>
  );
}

export function NewsRow({ item }: { item: ExternalItem }) {
  const summary = cleanText(item.summary);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group flex min-w-0 items-start gap-4 rounded-lg px-1 py-3.5 transition-colors hover:bg-raised/40"
    >
      <div className="min-w-0 flex-1">
        <Meta item={item} />
        <h3 className="mt-1 break-words text-[15px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {cleanText(item.title)}
        </h3>
        {summary ? (
          <p className="mt-1 line-clamp-2 break-words text-[12.5px] leading-relaxed text-muted [overflow-wrap:anywhere]">
            {summary}
          </p>
        ) : null}
      </div>
      {item.imageUrl ? (
        <Thumbnail src={item.imageUrl} className="h-[62px] w-[92px] shrink-0" />
      ) : null}
    </a>
  );
}

export function NewsCompactRow({ item }: { item: ExternalItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group block min-w-0 py-2.5"
    >
      <h3 className="line-clamp-2 break-words text-[13.5px] leading-snug text-ink transition-colors group-hover:text-accent">
        {cleanText(item.title)}
      </h3>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
        {hostOf(item.url)}
      </p>
    </a>
  );
}
