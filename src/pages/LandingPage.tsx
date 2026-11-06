import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MessageSquare,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import { postsApi } from '@/lib/api';
import { useSections } from '@/features/external/queries';
import { useAuth } from '@/providers/AuthProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buttonStyles } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/feedback';
import { hostOf, relativeTime, cleanText } from '@/lib/format';
import { eventStatus } from '@/components/external/EventCard';

function PreviewShell({
  title,
  to,
  icon: Icon,
  children,
}: {
  title: string;
  to: string;
  icon: typeof MessageSquare;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-lineStrong hover:shadow-soft sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
          <Icon size={13} className="text-subtle" aria-hidden="true" />
          {title}
        </span>
        <Link
          to={to}
          aria-label={`Open ${title}`}
          className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded-md text-subtle transition-colors hover:bg-raised hover:text-ink"
        >
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function BuzzPreview() {
  const feed = useQuery({
    queryKey: ['landing-feed'],
    queryFn: () => postsApi.feed({ limit: 3 }),
    staleTime: 60_000,
  });

  if (feed.isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const items = feed.data?.items ?? [];

  if (feed.isError || items.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-muted">
        {feed.isError
          ? 'The API is not reachable right now.'
          : 'No posts have been published yet. Yours could be the first.'}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((post) => (
        <li key={post.id}>
          <Link to={`/posts/${post.id}`} className="focus-ring group block rounded-sm">
            <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {post.title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
              {post.author.displayName} · {relativeTime(post.createdAt)} · {post.score} points
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NewsPreview() {
  const news = useSections('news');
  const items = news.data?.[0]?.items.slice(0, 3) ?? [];

  if (news.isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (news.isError || items.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-muted">
        {news.isError
          ? 'The API is not reachable right now.'
          : 'No articles are cached yet. The worker fills this from publisher feeds.'}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring group block rounded-sm"
          >
            <p className="line-clamp-2 break-words text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {cleanText(item.title)}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
              {cleanText(item.author) || hostOf(item.url)}
              {item.publishedAt ? ` · ${relativeTime(item.publishedAt)}` : ''}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

function TrendingPreview() {
  const trending = useSections('trending');
  const section =
    trending.data?.find((entry) => entry.section === 'repositories') ?? trending.data?.[0];
  const items = section?.items.slice(0, 3) ?? [];

  if (trending.isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (trending.isError || items.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-muted">
        {trending.isError
          ? 'The API is not reachable right now.'
          : 'Nothing cached yet. Trending is refreshed from GitHub, Hugging Face and paper feeds.'}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const stars = typeof item.metadata?.stars === 'number' ? item.metadata.stars : null;
        return (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="focus-ring group block rounded-sm"
            >
              <p className="truncate font-mono text-[12.5px] text-ink transition-colors group-hover:text-accent">
                {item.title}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                {stars !== null ? `${stars.toLocaleString('en')} stars` : section?.section}
              </p>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function EventsPreview() {
  const events = useSections('events');
  const now = Date.now();
  const items = (events.data ?? [])
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
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (events.isError || items.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-muted">
        {events.isError
          ? 'The API is not reachable right now.'
          : 'No upcoming events are cached. The worker pulls hackathons, contests and CTFs.'}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer noopener"
            className="focus-ring group block rounded-sm"
          >
            <p className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
              {item.title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
              {eventStatus(item) === 'ongoing' ? 'Happening now' : 'Upcoming'}
              {item.startsAt
                ? ` · ${new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(item.startsAt))}`
                : ''}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

const INSIDE = [
  {
    number: '01',
    title: 'Buzz',
    description:
      'Post a title and a body, reply in threads, vote on what helped you. Posts publish immediately; reports go to a human-reviewed moderation queue.',
  },
  {
    number: '02',
    title: 'News',
    description:
      'Five curated sections, refreshed from publisher feeds by the backend worker. Every headline opens at the source instead of a rewritten copy.',
  },
  {
    number: '03',
    title: 'Trending',
    description:
      'Repositories, models, datasets, papers, videos and podcasts — each rendered with the metadata that actually matters for its type.',
  },
  {
    number: '04',
    title: 'Events',
    description:
      'Hackathons, rated contests and CTF competitions, grouped by status so ongoing events do not get buried under next month’s.',
  },
];

export function LandingPage() {
  useDocumentTitle();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-subtle">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Buzz · News · Trending · Events
          </p>

          <h1 className="mt-5 font-serif text-[46px] leading-[0.98] tracking-[-0.025em] text-ink sm:text-[64px] lg:text-[76px]">
            Where developers
            <br />
            <em className="not-italic text-accent">think out loud</em>.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.65] text-muted">
            A community for people who build software: discuss what you are working on, read the
            day’s technology reporting, find the repositories and papers worth your attention, and
            keep track of the events worth blocking your calendar for.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link to="/buzz" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
                Open Buzz
              </Link>
            ) : (
              <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
                Create an account
              </Link>
            )}
            <Link to="/buzz" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Read Buzz first
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            Free · Email verification with a one-time code · No tracking pixels
          </p>
        </div>
      </section>

      <section
        aria-label="Live previews"
        className="mx-auto mt-14 w-full max-w-6xl px-4 sm:px-6 lg:mt-20 lg:px-8"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewShell title="Latest on Buzz" to="/buzz" icon={MessageSquare}>
            <BuzzPreview />
          </PreviewShell>
          <PreviewShell title="Headlines" to="/news" icon={Newspaper}>
            <NewsPreview />
          </PreviewShell>
          <PreviewShell title="Trending" to="/trending" icon={TrendingUp}>
            <TrendingPreview />
          </PreviewShell>
          <PreviewShell title="Coming up" to="/events" icon={CalendarDays}>
            <EventsPreview />
          </PreviewShell>
        </div>
        <p className="mt-3 text-[11.5px] text-subtle">
          These previews are live API data. Empty sections mean the backend cache has not been
          refreshed yet, not that the section is decorative.
        </p>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:mt-28 lg:px-8">
        <div className="border-t border-line pt-8">
          <h2 className="font-serif text-[30px] leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">
            Four sections, one reading habit
          </h2>

          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {INSIDE.map((item) => (
              <div key={item.number} className="flex gap-4">
                <span className="mt-1 font-mono text-[10.5px] tracking-[0.1em] text-subtle">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:mt-24 lg:px-8">
        <div className="rounded-2xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-lg">
              <h2 className="font-serif text-[28px] leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
                Start with one post.
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                No onboarding wizard, no follower minimum, no algorithm to please. Write something
                useful and the people who care will find it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={isAuthenticated ? '/buzz' : '/register'}
                className={buttonStyles({ variant: 'primary', size: 'md' })}
              >
                {isAuthenticated ? 'Write a post' : 'Join the community'}
              </Link>
              <Link to="/news" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
                Browse the news
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
