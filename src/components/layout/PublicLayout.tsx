import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Logo } from '@/components/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { buttonStyles } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { ConnectionBanner } from './ConnectionBanner';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/buzz', label: 'Buzz' },
  { to: '/news', label: 'News' },
  { to: '/trending', label: 'Trending' },
  { to: '/podcasts', label: 'Podcasts' },
  { to: '/events', label: 'Events' },
];

/** A hairline under the header that fills as the page scrolls. */
function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

function PublicHeader() {
  const { user } = useAuth();
  const progress = useScrollProgress();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        {user ? (
          <nav aria-label="Sections" className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'nav-underline focus-ring rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors',
                    isActive ? 'text-ink' : 'text-muted hover:text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-subtle md:inline">
            Discussion · Reading · Discovery · Listening
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to={`/users/${user.username}`}
                className="focus-ring hidden rounded-full sm:block"
                aria-label="Your profile"
              >
                <Avatar src={user.avatarUrl} name={user.displayName} size="sm" ring />
              </Link>
              <Link to="/buzz" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                Open Buzz
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="focus-ring hidden rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-muted transition-colors hover:text-ink sm:block"
              >
                Sign in
              </Link>
              <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-gradient-to-r from-accent via-accent2 to-transparent"
        style={{ transform: `scaleX(${progress})`, opacity: progress > 0.01 ? 1 : 0 }}
      />
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(50%_100%_at_50%_100%,rgb(var(--accent)/0.12),transparent)]"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
              A developer community for discussion, curated reading, listening and the events worth
              blocking your calendar for.
            </p>
            <Link
              to="/register"
              className="focus-ring mt-5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-accent transition-colors hover:text-ink"
            >
              Create an account
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>

          <nav aria-label="Sections">
            <h2 className="stat-label mb-3.5">Sections</h2>
            <ul className="space-y-2.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="stat-label mb-3.5">Account</h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/login"
                  className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  to="/buzz"
                  className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Open Buzz
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="stat-label mb-3.5">Legal</h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/terms"
                  className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="focus-ring text-[13px] text-muted transition-colors hover:text-ink"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-5 text-[11.5px] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Buzz and Bugs</span>
          <span>News, events, trending items and podcasts link to their original publishers.</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ConnectionBanner />
      <PublicHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
