import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
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
import { Reveal } from '@/components/ui/Reveal';
import { PodcastArtworkFallback } from '@/components/external/PodcastCard';
import { cleanText, formatCount, formatDuration, hostOf, relativeTime } from '@/lib/format';
import { numberMeta, stringMeta } from '@/lib/sections';
import { eventStatus } from '@/components/external/EventCard';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ shared */

const PANEL =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 lift hover:border-accent/30 hover:shadow-lift sm:p-6';

function PanelHeader({
  index,
  label,
  icon: Icon,
}: {
  index: string;
  label: string;
  icon: typeof MessageSquare;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[10px] tracking-[0.16em] text-subtle">{index}</span>
      <span className="h-3 w-px bg-line" aria-hidden="true" />
      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.11em] text-ink">
        <Icon size={13} className="text-accent" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

function PanelLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="focus-ring mt-5 inline-flex w-fit items-center gap-1.5 rounded-sm text-[12.5px] font-medium text-accent transition-colors hover:text-ink"
    >
      Explore {label}
      <ArrowRight
        size={13}
        aria-hidden="true"
        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      />
    </Link>
  );
}

function PanelDescription({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[13px] leading-relaxed text-muted">{children}</p>;
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-1.5">
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- buzz */

function BuzzPanel({ className }: { className?: string }) {
  const feed = useQuery({
    queryKey: ['landing-feed'],
    queryFn: () => postsApi.feed({ limit: 6 }),
    staleTime: 60_000,
  });

  const items = feed.data?.items ?? [];

  return (
    <Reveal className={className}>
      <article className={PANEL}>
        <PanelHeader index="01" label="Buzz" icon={MessageSquare} />

        <PanelDescription>
          Questions that need a real answer, decisions explained, bugs nobody else could reproduce.
          The conversation stays in order, so a good thread is still worth finding a week later.
        </PanelDescription>

        <div className="mt-5 flex flex-1 flex-col">
          {feed.isLoading ? (
            <ListSkeleton rows={2} />
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-[12.5px] leading-relaxed text-muted">
              The first threads are being written. Join and start one.
            </p>
          ) : (
            <ul className="grid content-start gap-2 sm:grid-cols-2">
              {items.map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/posts/${post.id}`}
                    className="focus-ring group/post flex h-full flex-col rounded-lg border border-line/70 bg-canvas/60 p-3 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface"
                  >
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink transition-colors group-hover/post:text-accent">
                      {post.title}
                    </p>
                    <p className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-0.5 pt-2 font-mono text-[9px] uppercase tracking-[0.07em] text-subtle">
                      <span className="max-w-[8.5rem] truncate">{post.author.displayName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatCount(post.score)} pts</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.replyCount} replies</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <PanelLink to="/buzz" label="Buzz" />
      </article>
    </Reveal>
  );
}

/* ------------------------------------------------------------------- news */

function NewsPanel({ className }: { className?: string }) {
  const news = useSections('news');
  const items = news.data?.flatMap((section) => section.items).slice(0, 3) ?? [];
  const [feature, ...rest] = items;

  return (
    <Reveal className={className} delay={80}>
      <article className={PANEL}>
        <PanelHeader index="02" label="News" icon={Newspaper} />

        <PanelDescription>
          The industry as it is being reported, gathered from five desks and opened at the
          publication that wrote it.
        </PanelDescription>

        <div className="mt-4 flex-1">
          {news.isLoading ? (
            <ListSkeleton />
          ) : !feature ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-[12.5px] leading-relaxed text-muted">
              Today&apos;s reporting is on its way.
            </p>
          ) : (
            <>
              <a
                href={feature.url}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring group/news block overflow-hidden rounded-xl border border-line transition-colors hover:border-accent/30"
              >
                {feature.imageUrl ? (
                  <span className="block h-28 overflow-hidden bg-raised sm:h-32">
                    <img
                      src={feature.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/news:scale-[1.04]"
                    />
                  </span>
                ) : null}
                <span
                  className={cn('block p-3.5', !feature.imageUrl && 'surface-tint bg-surface')}
                >
                  <span className="block font-serif text-[19px] leading-[1.2] tracking-[-0.01em] text-ink transition-colors group-hover/news:text-accent">
                    {cleanText(feature.title)}
                  </span>
                  <span className="mt-2 block font-mono text-[9.5px] uppercase tracking-[0.09em] text-subtle">
                    {cleanText(feature.author) || hostOf(feature.url)}
                    {feature.publishedAt ? ` · ${relativeTime(feature.publishedAt)}` : ''}
                  </span>
                </span>
              </a>

              {rest.length > 0 ? (
                <ul className="mt-2 divide-y divide-line">
                  {rest.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="focus-ring group/row flex items-baseline gap-3 rounded-sm py-2.5"
                      >
                        <span className="line-clamp-2 flex-1 text-[12.5px] leading-snug text-ink transition-colors group-hover/row:text-accent">
                          {cleanText(item.title)}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] text-subtle">
                          {hostOf(item.url)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>

        <PanelLink to="/news" label="News" />
      </article>
    </Reveal>
  );
}

/* --------------------------------------------------------------- trending */

function TrendingPanel({ className }: { className?: string }) {
  const trending = useSections('trending');
  const section =
    trending.data?.find((entry) => entry.section === 'repositories') ?? trending.data?.[0];
  const items = section?.items.slice(0, 3) ?? [];

  return (
    <Reveal className={className} delay={40}>
      <article className={cn(PANEL, 'surface-tint bg-raised/40 hover:bg-raised/60')}>
        <PanelHeader index="03" label="Trending" icon={TrendingUp} />

        <PanelDescription>
          The projects developers are actually picking up, ranked by the attention they have earned.
        </PanelDescription>

        <div className="mt-4 flex-1">
          {trending.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="text-[12.5px] leading-relaxed text-muted">
              The weekly ranking is being assembled.
            </p>
          ) : (
            <ol className="divide-y divide-line/80">
              {items.map((item, index) => {
                const stars = numberMeta(item.metadata, 'stars');
                const language = stringMeta(item.metadata, 'language');
                return (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="focus-ring group/rank flex items-baseline gap-3 rounded-sm py-2.5"
                    >
                      <span className="w-4 shrink-0 font-mono text-[10.5px] tabular-nums text-subtle">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[12.5px] text-ink transition-colors group-hover/rank:text-accent">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.08em] text-subtle">
                          {stars !== null ? `${formatCount(stars)} stars` : 'Trending'}
                          {language ? ` · ${language}` : ''}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <PanelLink to="/trending" label="Trending" />
      </article>
    </Reveal>
  );
}

/* ----------------------------------------------------------------- events */

function EventsPanel({ className }: { className?: string }) {
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

  return (
    <Reveal className={className} delay={80}>
      <article className={PANEL}>
        <PanelHeader index="04" label="Events" icon={CalendarDays} />

        <PanelDescription>
          Hackathons, contests and CTFs, ordered by when they start, so nothing closes before you
          notice.
        </PanelDescription>

        <div className="mt-4 flex-1">
          {events.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="text-[12.5px] leading-relaxed text-muted">
              The calendar is quiet for now. New events are added every hour.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} className="flex gap-3.5">
                  <EventDate value={item.startsAt} />
                  <div className="relative min-w-0 flex-1 border-l border-line pb-4 pl-3.5 last:pb-0">
                    <span
                      className="absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-accent/80"
                      aria-hidden="true"
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="focus-ring group/event block rounded-sm"
                    >
                      <span className="line-clamp-2 text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover/event:text-accent">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.08em] text-subtle">
                        {eventStatus(item) === 'ongoing' ? 'Happening now' : 'Upcoming'}
                      </span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <PanelLink to="/events" label="Events" />
      </article>
    </Reveal>
  );
}

function EventDate({ value }: { value: string | null }) {
  const date = value ? new Date(value) : null;
  const valid = date && !Number.isNaN(date.getTime());

  return (
    <div className="w-9 shrink-0 text-center">
      <p className="font-mono text-[15px] leading-none tabular-nums text-ink">
        {valid ? new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date) : '--'}
      </p>
      <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-subtle">
        {valid ? new Intl.DateTimeFormat('en', { month: 'short' }).format(date) : ''}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- podcasts */

function PodcastsPanel({ className }: { className?: string }) {
  const podcasts = useSections('podcasts');
  const items = (podcasts.data ?? [])
    .flatMap((section) => section.items)
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  return (
    <Reveal className={className} delay={120}>
      <article className={PANEL}>
        <PanelHeader index="05" label="Podcasts" icon={Mic} />

        <PanelDescription>
          Long-form conversations with the people who build and maintain the tools you depend on.
        </PanelDescription>

        <div className="mt-4 flex-1">
          {podcasts.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="text-[12.5px] leading-relaxed text-muted">
              The listening queue is being filled.
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <PodcastRow item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <PanelLink to="/podcasts" label="Podcasts" />
      </article>
    </Reveal>
  );
}

function PodcastRow({ item }: { item: ExternalItem }) {
  const publisher = stringMeta(item.metadata, 'publisher') ?? item.author;
  const duration = formatDuration(numberMeta(item.metadata, 'durationSeconds'));

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring group/ep -mx-1.5 flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-raised"
    >
      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-line bg-raised">
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
          <PodcastArtworkFallback />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[9px] uppercase tracking-[0.1em] text-subtle">
          {publisher ?? 'Podcast'}
        </span>
        <span className="line-clamp-2 block text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover/ep:text-accent">
          {item.title}
        </span>
        {duration ? (
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.08em] text-subtle">
            {duration}
          </span>
        ) : null}
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------- page */

export function LandingPage() {
  useDocumentTitle();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="dot-grid absolute inset-0 opacity-70" />
          <span className="aura -left-32 -top-40 h-[420px] w-[420px] bg-accent/25" />
          <span
            className="aura right-[-8%] top-24 h-[340px] w-[340px] bg-up/[0.12]"
            style={{ animationDelay: '-8s' }}
          />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              A community for people who build software
            </p>

            <h1 className="mt-6 font-serif text-[46px] leading-[0.96] tracking-[-0.03em] text-ink sm:text-[64px] lg:text-[78px]">
              Where developers{' '}
              <br />
              <span className="relative inline-block text-accent">
                think out loud
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-accent/25"
                />
              </span>
              .
            </h1>

            <p className="mt-7 max-w-xl text-[15.5px] leading-[1.7] text-muted">
              Building software is mostly conversation: a question asked, a decision explained, a
              mistake shared so nobody else repeats it. Buzz and Bugs keeps that conversation beside
              the reporting, projects, shows and events that make it worth following.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/buzz"
                  className={buttonStyles({
                    variant: 'primary',
                    size: 'lg',
                    className: 'shadow-lift',
                  })}
                >
                  Open Buzz
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={buttonStyles({
                      variant: 'primary',
                      size: 'lg',
                      className: 'shadow-lift',
                    })}
                  >
                    Create an account
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <Link to="/buzz" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
                    Browse the feed
                  </Link>
                </>
              )}
            </div>

            {!isAuthenticated ? (
              <p className="mt-5 text-[12.5px] text-subtle">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="focus-ring rounded-sm font-medium text-muted underline decoration-lineStrong underline-offset-2 transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                .
              </p>
            ) : null}
          </div>

          <a
            href="#sections"
            className="focus-ring mt-12 hidden w-fit items-center gap-1.5 rounded-sm text-[12px] font-medium text-subtle transition-colors hover:text-ink lg:inline-flex"
          >
            See the five sections
            <ChevronDown size={13} aria-hidden="true" className="animate-pulse-soft" />
          </a>
        </div>
      </section>

      <section
        id="sections"
        aria-labelledby="sections-heading"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 pb-4 sm:px-6 lg:px-8"
      >
        <Reveal>
          <div className="max-w-2xl">
            <p className="meta">The platform</p>
            <h2
              id="sections-heading"
              className="mt-3 font-serif text-[32px] leading-[1.05] tracking-[-0.025em] text-ink sm:text-[42px]"
            >
              Five views of the same field.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Each section answers a different question — what people are saying, what is being
              reported, what is being built, what is coming up, and who is talking about it.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-12">
          <BuzzPanel className="md:col-span-2 lg:col-span-7" />
          <NewsPanel className="md:col-span-2 lg:col-span-5" />
          <TrendingPanel className="md:col-span-1 lg:col-span-4" />
          <EventsPanel className="md:col-span-1 lg:col-span-4" />
          <PodcastsPanel className="md:col-span-2 lg:col-span-4" />
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:px-6 lg:mt-24 lg:px-8">
        <Reveal>
          <div className="accent-rule surface-tint relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-lg">
                <h2 className="font-serif text-[30px] leading-[1.05] tracking-[-0.025em] text-ink sm:text-[36px]">
                  Every good thread starts with a question.
                </h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                  Bring the bug you cannot reproduce, the design decision you are unsure about, or
                  the library you want a second opinion on. That is what this place is for.
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
                  Read the news
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {!isAuthenticated ? (
              <p className="mt-7 text-[11.5px] leading-relaxed text-subtle">
                By creating an account you agree to our{' '}
                <Link
                  to="/terms"
                  className="text-muted underline underline-offset-2 transition-colors hover:text-ink"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-muted underline underline-offset-2 transition-colors hover:text-ink"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            ) : null}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
