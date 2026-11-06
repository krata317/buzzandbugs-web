import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSections } from '@/features/external/queries';
import { usePost } from '@/features/posts/queries';
import { useProfile } from '@/features/users/queries';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/users/FollowButton';
import { Skeleton } from '@/components/ui/feedback';
import { SectionJumpNav } from '@/components/external/SectionJumpNav';
import { NewsCompactRow } from '@/components/external/NewsCard';
import {
  EVENT_SECTIONS,
  NEWS_SECTIONS,
  PODCAST_SECTIONS,
  TRENDING_SECTIONS,
  platformLabel,
  type SectionKind,
} from '@/lib/sections';
import { formatCount, formatDayNumber, formatMonth, formatTime } from '@/lib/format';

function RailCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="stat-label">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewMore({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="focus-ring inline-flex items-center gap-1 text-2xs uppercase tracking-[0.1em] text-subtle transition-colors hover:text-accent"
    >
      {label}
      <ArrowRight size={10} aria-hidden="true" />
    </Link>
  );
}

function SectionRail({
  kind,
  basePath,
  sections,
}: {
  kind: SectionKind;
  basePath: string;
  sections: readonly string[];
}) {
  return (
    <RailCard title="Sections">
      <SectionJumpNav kind={kind} basePath={basePath} sections={sections} />
    </RailCard>
  );
}

function LatestNewsRail() {
  const news = useSections('news');
  const items = news.data?.flatMap((section) => section.items).slice(0, 3) ?? [];

  if (news.isLoading) {
    return (
      <RailCard title="Latest news">
        <div className="space-y-2.5">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </RailCard>
    );
  }

  if (items.length === 0) {
    return (
      <RailCard title="Latest news">
        <p className="text-[12.5px] leading-relaxed text-muted">
          Today&apos;s technology reporting will appear here as it is published.
        </p>
      </RailCard>
    );
  }

  return (
    <RailCard title="Latest news" action={<ViewMore to="/news" label="View more" />}>
      <div className="divide-y divide-line">
        {items.map((item) => (
          <NewsCompactRow key={item.id} item={item} />
        ))}
      </div>
    </RailCard>
  );
}

function UpcomingEventsRail() {
  const events = useSections('events');
  const now = Date.now();

  const upcoming = (events.data ?? [])
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
    .slice(0, 3);

  if (events.isLoading) {
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

  if (upcoming.length === 0) {
    return (
      <RailCard title="Coming up">
        <p className="text-[12.5px] leading-relaxed text-muted">
          Hackathons, contests and CTF competitions will be listed here as they are announced.
        </p>
      </RailCard>
    );
  }

  return (
    <RailCard title="Coming up" action={<ViewMore to="/events" label="View more" />}>
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
          <span>{formatCount(profile.data?.stats.followers ?? null)} followers</span>
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
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  let content: ReactNode = null;

  if (pathname === '/buzz' || pathname === '/') {
    content = (
      <>
        <LatestNewsRail />
        <UpcomingEventsRail />
      </>
    );
  } else if (pathname.startsWith('/news')) {
    content = <SectionRail kind="news" basePath="/news" sections={NEWS_SECTIONS} />;
  } else if (pathname.startsWith('/trending')) {
    content = <SectionRail kind="trending" basePath="/trending" sections={TRENDING_SECTIONS} />;
  } else if (pathname.startsWith('/podcasts')) {
    content = <SectionRail kind="podcasts" basePath="/podcasts" sections={PODCAST_SECTIONS} />;
  } else if (pathname.startsWith('/events')) {
    content = (
      <>
        <UpcomingEventsRail />
        <SectionRail kind="events" basePath="/events" sections={EVENT_SECTIONS} />
      </>
    );
  } else if (pathname.startsWith('/posts/') && params.id) {
    content = <AuthorRail postId={params.id} />;
  }

  if (!content) return null;

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen w-[316px] shrink-0 overflow-y-auto border-l border-line px-5 py-6 xl:block',
      )}
    >
      <div className="space-y-4">{content}</div>
    </aside>
  );
}
