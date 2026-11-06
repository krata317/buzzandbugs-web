import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Github, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSections } from '@/features/external/queries';
import { usePost } from '@/features/posts/queries';
import { useProfile } from '@/features/users/queries';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/users/FollowButton';
import { Skeleton } from '@/components/ui/feedback';
import {
  EVENT_SECTIONS,
  NEWS_SECTIONS,
  TRENDING_SECTIONS,
  numberMeta,
  platformLabel,
  sectionLabel,
} from '@/lib/sections';
import { formatCount, formatDayNumber, formatMonth, formatTime } from '@/lib/format';
import type { ExternalItem } from '@/lib/api/types';

function RailCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RailLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="focus-ring flex items-baseline justify-between gap-3 rounded-md py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}

function RepositoryRail() {
  const query = useSections('trending');
  const repositories = query.data?.find((section) => section.section === 'repositories');

  if (query.isLoading) {
    return (
      <RailCard title="Trending repositories">
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-3.5 w-full" />
          ))}
        </div>
      </RailCard>
    );
  }

  if (!repositories || repositories.items.length === 0) return null;

  return (
    <RailCard
      title="Trending repositories"
      action={
        <Link
          to="/trending/repositories"
          className="focus-ring text-2xs uppercase tracking-[0.1em] text-subtle transition-colors hover:text-accent"
        >
          All
        </Link>
      }
    >
      <ul className="space-y-0.5">
        {repositories.items.slice(0, 5).map((item) => {
          const stars = numberMeta(item.metadata, 'stars');
          const owner = typeof item.metadata?.owner === 'string' ? item.metadata.owner : null;
          const name = typeof item.metadata?.name === 'string' ? item.metadata.name : item.title;
          return (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring group flex items-start gap-2 rounded-md py-1.5 transition-colors"
              >
                <Github size={13} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] leading-snug text-ink group-hover:text-accent">
                    {owner ? <span className="text-muted">{owner}/</span> : null}
                    {name}
                  </span>
                  {stars !== null ? (
                    <span className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] text-subtle">
                      <Star size={9} aria-hidden="true" /> {formatCount(stars)}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </RailCard>
  );
}

function AboutBuzzRail() {
  return (
    <RailCard title="How Buzz works">
      <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
        <li>Posts publish immediately and are ranked by votes and recency.</li>
        <li>Reports send a post to moderation. Flagged posts are hidden while the author can appeal.</li>
        <li>Replies are capped at ten per person on each post.</li>
      </ul>
      <p className="mt-3 border-t border-line pt-3 text-[12px] leading-relaxed text-subtle">
        Your feed is chronological, with a small boost for people you follow.
      </p>
    </RailCard>
  );
}

function SectionsRail({
  kind,
  basePath,
  sections,
}: {
  kind: 'news' | 'trending' | 'events';
  basePath: string;
  sections: readonly string[];
}) {
  const query = useSections(kind);
  const totals = new Map(query.data?.map((section) => [section.section, section.total]) ?? []);
  const { pathname } = useLocation();

  return (
    <RailCard title="Sections">
      <div className="space-y-0.5">
        {sections.map((section) => {
          const total = totals.get(section);
          const active = pathname === `${basePath}/${section}`;
          return (
            <RailLink key={section} to={`${basePath}/${section}`}>
              <span className={cn('truncate', active && 'font-medium text-ink')}>
                {sectionLabel(kind, section)}
              </span>
              {typeof total === 'number' ? (
                <span className="shrink-0 font-mono text-[10.5px] text-subtle">{total}</span>
              ) : null}
            </RailLink>
          );
        })}
      </div>
    </RailCard>
  );
}

function UpcomingEventsRail() {
  const query = useSections('events');
  const now = Date.now();

  const upcoming = (query.data ?? [])
    .flatMap((section) => section.items)
    .filter((item) => {
      const end = item.endsAt ? new Date(item.endsAt).getTime() : null;
      return end === null || end > now;
    })
    .sort((a, b) => {
      const aStart = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bStart = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aStart - bStart;
    })
    .slice(0, 4);

  if (query.isLoading) {
    return (
      <RailCard title="Coming up">
        <div className="space-y-2.5">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </RailCard>
    );
  }

  if (upcoming.length === 0) return null;

  return (
    <RailCard
      title="Coming up"
      action={
        <Link
          to="/events"
          className="focus-ring text-2xs uppercase tracking-[0.1em] text-subtle transition-colors hover:text-accent"
        >
          All
        </Link>
      }
    >
      <ul className="space-y-2">
        {upcoming.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="focus-ring group flex items-start gap-2.5 rounded-md py-1"
            >
              <span className="flex w-8 shrink-0 flex-col items-center rounded border border-line bg-raised/60 py-1">
                <span className="font-mono text-[12px] font-medium leading-none text-ink">
                  {item.startsAt ? formatDayNumber(item.startsAt) : '–'}
                </span>
                <span className="mt-0.5 font-mono text-[8.5px] uppercase leading-none text-subtle">
                  {item.startsAt ? formatMonth(item.startsAt) : ''}
                </span>
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-[12.5px] leading-snug text-ink group-hover:text-accent">
                  {item.title}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                  {platformLabel(item.metadata?.platform) ?? 'Event'}
                  {item.startsAt ? ` · ${formatTime(item.startsAt)}` : ''}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function AuthorRail({ postId }: { postId: string }) {
  const post = usePost(postId);
  const author = post.data?.author;
  const profile = useProfile(author?.username ?? undefined);

  if (!author || author.deleted || !author.username) return null;

  return (
    <RailCard title="About the author">
      <div className="flex items-start gap-3">
        <Avatar src={author.avatarUrl} name={author.displayName} size="lg" ring />
        <div className="min-w-0">
          <Link
            to={`/users/${author.username}`}
            className="focus-ring block truncate text-[14px] font-medium text-ink hover:text-accent"
          >
            {author.displayName}
          </Link>
          <p className="truncate font-mono text-[11.5px] text-subtle">@{author.username}</p>
        </div>
      </div>
      {profile.data?.about ? (
        <p className="mt-3 line-clamp-4 text-[12.5px] leading-relaxed text-muted">
          {profile.data.about}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex gap-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">
          <span>
            {formatCount(profile.data?.stats.followers ?? null)} followers
          </span>
          <span>{formatCount(profile.data?.stats.posts ?? 0)} posts</span>
        </div>
        {profile.data && !profile.data.viewer.isSelf ? (
          <FollowButton
            username={author.username}
            isFollowing={profile.data.viewer.isFollowing}
            size="sm"
          />
        ) : null}
      </div>
    </RailCard>
  );
}

function ExternalLinkCard({ item }: { item: ExternalItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group flex items-start gap-2 rounded-md py-1.5"
    >
      <CalendarDays size={13} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[12.5px] leading-snug text-ink group-hover:text-accent">
          {item.title}
        </span>
      </span>
      <ArrowUpRight size={12} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
    </a>
  );
}

export function RightRail() {
  const { pathname } = useLocation();
  const params = useParams();

  if (
    pathname.startsWith('/settings') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/appeals') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  let content: ReactNode = null;

  if (pathname === '/buzz' || pathname === '/') {
    content = (
      <>
        <RepositoryRail />
        <AboutBuzzRail />
      </>
    );
  } else if (pathname.startsWith('/news')) {
    content = <SectionsRail kind="news" basePath="/news" sections={NEWS_SECTIONS} />;
  } else if (pathname.startsWith('/trending')) {
    content = <SectionsRail kind="trending" basePath="/trending" sections={TRENDING_SECTIONS} />;
  } else if (pathname.startsWith('/events')) {
    content = (
      <>
        <UpcomingEventsRail />
        <SectionsRail kind="events" basePath="/events" sections={EVENT_SECTIONS} />
      </>
    );
  } else if (pathname.startsWith('/posts/') && params.id) {
    content = <AuthorRail postId={params.id} />;
  }

  if (!content) return null;

  return (
    <aside className="sticky top-0 hidden h-screen w-[316px] shrink-0 overflow-y-auto border-l border-line px-5 py-6 xl:block">
      <div className="space-y-4">{content}</div>
    </aside>
  );
}

export { ExternalLinkCard };
