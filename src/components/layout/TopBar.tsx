import { Link } from 'react-router-dom';
import { Bell, CalendarDays, MessageSquare, Newspaper, Settings, TrendingUp, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuth } from '@/providers/AuthProvider';
import { useUnreadCount } from '@/features/notifications/queries';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const count = unread.data ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-sm lg:hidden">
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          to="/notifications"
          aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
          className="focus-ring relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Bell size={17} aria-hidden="true" />
          {count > 0 ? (
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-canvas" />
          ) : null}
        </Link>
        {user ? (
          <Link
            to={`/users/${user.username}`}
            aria-label="Your profile"
            className="focus-ring ml-0.5 rounded-full"
          >
            <Avatar src={user.avatarUrl} name={user.displayName} size="xs" ring />
          </Link>
        ) : (
          <Link
            to="/login"
            className="focus-ring ml-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

const TABS = [
  { to: '/buzz', label: 'Buzz', icon: MessageSquare },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/trending', label: 'Trending', icon: TrendingUp },
  { to: '/events', label: 'Events', icon: CalendarDays },
] as const;

export function MobileTabBar() {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                  {tab.label}
                </>
              )}
            </NavLink>
          );
        })}
        <NavLink
          to={user ? `/users/${user.username}` : '/login'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors',
              isActive ? 'text-accent' : 'text-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              {user ? (
                <Avatar src={user.avatarUrl} name={user.displayName} size="xs" />
              ) : (
                <User size={19} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              )}
              {user ? 'You' : 'Sign in'}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

export function MobileUtilityLinks() {
  return (
    <div className="mt-2 space-y-0.5 border-t border-line pt-2">
      <NavLink to="/notifications" className="nav-link">
        <Bell size={16} className="text-subtle" /> Notifications
      </NavLink>
      <NavLink to="/settings" className="nav-link">
        <Settings size={16} className="text-subtle" /> Settings
      </NavLink>
    </div>
  );
}
