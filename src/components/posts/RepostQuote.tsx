import { Link } from 'react-router-dom';
import { Repeat2 } from 'lucide-react';
import type { RepostTarget, RichTextNode } from '@/lib/api/types';
import { RichText } from './RichText';

export function RepostQuote({
  target,
  showContent,
}: {
  target: RepostTarget & { content?: RichTextNode | null };
  showContent?: boolean;
}) {
  if (!target.available) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-line bg-raised/40 px-3.5 py-3 text-[12.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <Repeat2 size={12} aria-hidden="true" />
          The original post is no longer available.
        </span>
      </div>
    );
  }

  const author = target.author;

  return (
    <div className="mt-3 rounded-lg border border-line bg-raised/40 px-3.5 py-3 transition-colors hover:border-lineStrong">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-subtle">
        <Repeat2 size={12} aria-hidden="true" />
        {author.username ? (
          <Link
            to={`/users/${author.username}`}
            className="focus-ring font-medium text-muted hover:text-accent"
          >
            {author.displayName}
          </Link>
        ) : (
          <span className="font-medium text-muted">{author.displayName}</span>
        )}
        {author.username ? <span className="font-mono">@{author.username}</span> : null}
      </div>

      <Link
        to={`/posts/${target.id}`}
        className="focus-ring mt-1 block break-words text-[14px] font-medium leading-snug text-ink transition-colors hover:text-accent"
      >
        {target.title}
      </Link>

      {showContent && target.content ? (
        <RichText
          doc={target.content}
          className="post-body mt-2 text-[13.5px] leading-relaxed text-muted"
        />
      ) : target.excerpt ? (
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
          {target.excerpt}
        </p>
      ) : null}
    </div>
  );
}
