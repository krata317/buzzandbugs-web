import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MessageSquare,
  Mic,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import { postsApi } from '@/lib/api';
import type { ExternalItem } from '@/lib/api/types';
import { useSections } from '@/features/external/queries';
import { useAuth } from '@/providers/AuthProvider';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { buttonStyles } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/feedback';
import { cleanText, formatCount, formatDate, hostOf, relativeTime } from '@/lib/format';
import { numberMeta, stringMeta } from '@/lib/sections';
import { eventStatus } from '@/components/external/EventCard';

function PreviewShell({
  title,
  to,
  icon: Icon,
  children,
  wide,
}: {
  title: string;
  to: string;
  icon: typeof MessageSquare;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      className={[
        'flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-lineStrong hover:shadow-soft sm:p-5',
        wide ? 'sm:col-span-2' : '',
      ].join(' ')}
    >
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

function EmptyPreview({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] leading-relaxed text-muted">{children}</p>;
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
      <EmptyPreview>
        Conversations about the work of building software will appear here as the community starts
        talking.
      </EmptyPreview>
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
              {post.author.displayName} · {relativeTime(post.createdAt)} · {formatCount(post.score)}{' '}
              points
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
      <EmptyPreview>
        Today&apos;s technology reporting will appear here, with every headline linking to the
        original publication.
      </EmptyPreview>
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
      <EmptyPreview>
        The repositories, models and papers the community is watching will appear here.
      </EmptyPreview>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const stars = numberMeta(item.metadata, 'stars');
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
                {stars !== null ? `${formatCount(stars)} stars` : 'Trending'}
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
      <EmptyPreview>
        Upcoming hackathons, coding contests and Capture the Flag competitions will appear here.
      </EmptyPreview>
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
              {item.startsAt ? ` · ${formatDate(item.startsAt)}` : ''}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

function PodcastShelf() {
  const podcasts = useSections('podcasts');
  const items = (podcasts.data ?? [])
    .flatMap((section) => section.items)
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  if (podcasts.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (podcasts.isError || items.length === 0) {
    return (
      <EmptyPreview>
        Episodes from The Changelog, freeCodeCamp, Software Engineering Daily, InfoQ and Syntax will
        appear here.
      </EmptyPreview>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <PodcastMini key={item.id} item={item} />
      ))}
    </div>
  );
}

function PodcastMini({ item }: { item: ExternalItem }) {
  const publisher = stringMeta(item.metadata, 'publisher') ?? item.author;
  const duration = numberMeta(item.metadata, 'durationSeconds');
  const minutes = duration ? Math.max(1, Math.round(duration / 60)) : null;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group flex gap-3 rounded-lg border border-line bg-surface p-2.5 transition-colors hover:border-lineStrong"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-raised text-accent">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <Mic size={16} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-subtle">
          {publisher ?? 'Podcast'}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
          {item.title}
        </span>
        <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.08em] text-subtle">
          {minutes ? `${minutes} min` : ''}
          {minutes && item.publishedAt ? ' · ' : ''}
          {item.publishedAt ? formatDate(item.publishedAt) : ''}
        </span>
      </span>
    </a>
  );
}

const INSIDE = [
  {
    number: '01',
    title: 'Buzz',
    description:
      'Post a title and a body, reply in threads, vote on what helped you. Mentions and links work the way you expect, and drafts stay on your device until you publish.',
  },
  {
    number: '02',
    title: 'News',
    description:
      'Five curated sections covering the industry, AI and research, security, platform announcements and Indian technology — each headline opening at the original publication.',
  },
  {
    number: '03',
    title: 'Trending',
    description:
      'Repositories, models, datasets, papers and videos, each presented with the details that actually matter for that kind of work.',
  },
  {
    number: '04',
    title: 'Podcasts',
    description:
      'Five long-running shows about building software, collected in one place so you can catch up on the episodes you missed.',
  },
  {
    number: '05',
    title: 'Events',
    description:
      'Hackathons, rated contests and Capture the Flag competitions, grouped so ongoing events never get buried under next month’s.',
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
            Buzz · News · Trending · Podcasts · Events
          </p>

          <h1 className="mt-5 font-serif text-[46px] leading-[0.98] tracking-[-0.025em] text-ink sm:text-[64px] lg:text-[76px]">
            Where developers
            <br />
            <em className="not-italic text-accent">think out loud</em>.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.65] text-muted">
            A community for people who build software: discuss what you are working on, read the
            day&apos;s technology reporting, find the projects worth your attention, listen to the
            shows that explain how things work, and keep track of the events worth blocking your
            calendar for.
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
            Free to join · One-time email verification · No tracking pixels
          </p>
        </div>
      </section>

      <section
        aria-label="What is happening now"
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
          <PreviewShell title="Latest episodes" to="/podcasts" icon={Mic} wide>
            <PodcastShelf />
          </PreviewShell>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:mt-28 lg:px-8">
        <div className="border-t border-line pt-8">
          <h2 className="font-serif text-[30px] leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">
            Five sections, one reading habit
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

          {!isAuthenticated ? (
            <p className="mt-6 text-[11.5px] leading-relaxed text-subtle">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-muted underline underline-offset-2 hover:text-ink">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-muted underline underline-offset-2 hover:text-ink">
                Privacy Policy
              </Link>
              .
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
