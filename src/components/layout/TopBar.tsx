import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  MessageSquare,
  Mic,
  Newspaper,
  Settings,
  TrendingUp,
} from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:hidden">
      <Logo />
      <div className="flex items-center gap-0.5">
        <ThemeToggle />
        <Link
          to="/settings"
          aria-label="Settings"
          title="Settings"
          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Settings size={17} aria-hidden="true" />
        </Link>
        <Link
          to="/notifications"
          aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
          className="focus-ring relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <Bell size={17} aria-hidden="true" />
          {count > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-canvas" />
          ) : null}
        </Link>
        {user ? (
          <Link
            to={`/users/${user.username}`}
            aria-label="Your profile"
            className="focus-ring ml-1 rounded-full"
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
  { to: '/podcasts', label: 'Podcasts', icon: Mic },
  { to: '/events', label: 'Events', icon: CalendarDays },
] as const;

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="focus-ring flex flex-col items-center gap-0.5 py-2"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200',
                      isActive ? 'bg-accent/12 text-accent' : 'text-muted',
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      isActive ? 'text-accent' : 'text-muted',
                    )}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
