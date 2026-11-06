import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronUp,
  LogOut,
  MessageSquare,
  Newspaper,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/providers/AuthProvider';
import { useUnreadCount } from '@/features/notifications/queries';
import { Avatar } from '@/components/ui/Avatar';
import { buttonStyles } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from './ThemeToggle';

const PRIMARY_NAV = [
  { to: '/buzz', label: 'Buzz', icon: MessageSquare },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/trending', label: 'Trending', icon: TrendingUp },
  { to: '/events', label: 'Events', icon: CalendarDays },
] as const;

const SECONDARY_NAV = [
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto rounded-full bg-accent/12 px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-accent">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function NavItem({
  to,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Bell;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <NavLink to={to} onClick={onNavigate} className="nav-link">
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              isActive ? 'text-accent' : 'text-subtle',
            )}
          >
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} aria-hidden="true" />
          </span>
          <span className={cn(isActive && 'text-ink')}>{label}</span>
          {badge ? <UnreadBadge count={badge} /> : null}
        </>
      )}
    </NavLink>
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="space-y-2">
        <Link
          to="/register"
          className={buttonStyles({ variant: 'primary', size: 'md', fullWidth: true })}
        >
          Create account
        </Link>
        <Link
          to="/login"
          className="focus-ring block rounded-md py-1.5 text-center text-[13px] text-muted transition-colors hover:text-ink"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 animate-scale-in overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lift"
        >
          <Link
            to={`/users/${user.username}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-raised"
          >
            <User size={14} className="text-subtle" /> Your profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-raised"
          >
            <Settings size={14} className="text-subtle" /> Settings
          </Link>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-line hover:bg-raised"
      >
        <Avatar src={user.avatarUrl} name={user.displayName} size="sm" ring />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-tight text-ink">
            {user.displayName}
          </span>
          <span className="block truncate font-mono text-[11px] leading-tight text-subtle">
            @{user.username}
          </span>
        </span>
        <ChevronUp
          size={14}
          className={cn('shrink-0 text-subtle transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const unread = useUnreadCount();
  const unreadCount = unread.data ?? 0;

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line px-3.5 py-5 lg:flex xl:w-[248px]">
      <div className="px-2">
        <Logo />
      </div>

      <nav aria-label="Primary" className="mt-7 space-y-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="my-4 h-px bg-line" />

      <nav aria-label="Your account" className="space-y-0.5">
        {SECONDARY_NAV.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            badge={item.to === '/notifications' ? unreadCount : undefined}
          />
        ))}
        {user ? (
          <NavItem to={`/users/${user.username}`} label="Profile" icon={User} />
        ) : null}
      </nav>

      <div className="mt-auto pt-6">
        {!isAuthenticated ? (
          <div className="mb-4 rounded-lg border border-line bg-raised/60 px-3 py-3">
            <p className="text-[12.5px] leading-relaxed text-muted">
              Join the conversation. Post, reply and follow the developers you learn from.
            </p>
          </div>
        ) : null}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">Theme</span>
          <ThemeToggle />
        </div>
        <AccountMenu />
      </div>
    </aside>
  );
}
