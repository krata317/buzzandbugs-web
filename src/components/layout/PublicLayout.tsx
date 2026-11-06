import { Link, NavLink, Outlet } from 'react-router-dom';
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

function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
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
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            A developer community for discussion, curated reading, listening and the events worth
            blocking your calendar for.
          </p>
        </div>

        <nav aria-label="Sections">
          <h2 className="meta mb-3">Sections</h2>
          <ul className="space-y-2">
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
          <h2 className="meta mb-3">Account</h2>
          <ul className="space-y-2">
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
                Read Buzz
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="meta mb-3">Legal</h2>
          <ul className="space-y-2">
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

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-[12px] text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
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
