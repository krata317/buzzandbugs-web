import { useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  LogOut,
  MessageSquare,
  Mic,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/hooks/useClickOutside';
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
  { to: '/podcasts', label: 'Podcasts', icon: Mic },
  { to: '/events', label: 'Events', icon: CalendarDays },
] as const;

const SECONDARY_NAV = [
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

function UnreadBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count <= 0) return null;

  if (collapsed) {
    return (
      <span
        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-canvas"
        aria-hidden="true"
      />
    );
  }

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
  collapsed,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof Bell;
  badge?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      aria-label={label}
      data-tooltip={collapsed ? label : undefined}
      className={cn('nav-link', collapsed && 'justify-center px-0')}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'relative flex h-7 w-7 items-center justify-center rounded-md transition-colors',
              isActive ? 'text-accent' : 'text-subtle',
            )}
          >
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} aria-hidden="true" />
            {badge ? <UnreadBadge count={badge} collapsed={Boolean(collapsed)} /> : null}
          </span>
          {!collapsed ? (
            <>
              <span className={cn(isActive && 'text-ink')}>{label}</span>
              {badge ? <UnreadBadge count={badge} collapsed={false} /> : null}
            </>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, () => setOpen(false), open);

  const leave = async () => {
    setOpen(false);
    // Leave the protected area first: clearing the session while still on an app route makes
    // the route guard redirect to /login before this navigation can run.
    navigate('/', { replace: true });
    await signOut();
  };

  if (!user) {
    if (collapsed) {
      return (
        <Link
          to="/login"
          aria-label="Sign in"
          data-tooltip="Sign in"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink"
        >
          <User size={16} />
        </Link>
      );
    }

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
          className={cn(
            'absolute z-50 mb-2 animate-scale-in overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lift',
            collapsed ? 'bottom-0 left-full ml-2 w-44' : 'bottom-full left-0 right-0',
          )}
        >
          <Link
            to={`/users/${user.username}`}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink transition-colors hover:bg-raised"
          >
            <User size={14} className="text-subtle" /> Your profile
          </Link>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void leave()}
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
        aria-label="Account menu"
        data-tooltip={collapsed ? user.displayName : undefined}
        className={cn(
          'focus-ring flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-line hover:bg-raised',
          collapsed && 'justify-center p-1.5',
        )}
      >
        <Avatar src={user.avatarUrl} name={user.displayName} size="sm" ring />
        {!collapsed ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight text-ink">
              {user.displayName}
            </span>
            <span className="block truncate font-mono text-[11px] leading-tight text-subtle">
              @{user.username}
            </span>
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const unread = useUnreadCount();
  const unreadCount = unread.data ?? 0;

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line py-5 transition-[width,padding] duration-200 ease-out lg:flex',
        'bg-[linear-gradient(180deg,rgb(var(--raised)/0.65),rgb(var(--canvas))_42%)]',
        collapsed ? 'w-[76px] px-2.5' : 'w-[236px] px-3.5 xl:w-[248px]',
      )}
      data-collapsed={collapsed}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          collapsed ? 'flex-col' : 'justify-between pl-2 pr-1',
        )}
      >
        <Logo showWordmark={!collapsed} />

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar-nav"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          data-tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            'border border-line bg-surface text-muted shadow-soft',
            'transition-[color,border-color,background-color,transform] duration-150 ease-out',
            'hover:border-accent/40 hover:bg-accent/5 hover:text-accent active:scale-95',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      <nav id="app-sidebar-nav" aria-label="Primary" className="mt-6 space-y-0.5">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={cn('my-4 h-px bg-line', collapsed && 'mx-1')} />

      <nav aria-label="Your account" className="space-y-0.5">
        {SECONDARY_NAV.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            badge={item.to === '/notifications' ? unreadCount : undefined}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6">
        {!isAuthenticated && !collapsed ? (
          <div className="rounded-lg border border-line bg-raised/60 px-3 py-3">
            <p className="text-[12.5px] leading-relaxed text-muted">
              Join the conversation. Post, reply and follow the developers you learn from.
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            'flex items-center',
            collapsed ? 'flex-col gap-1.5' : 'justify-between px-1',
          )}
        >
          <span
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.1em] text-subtle',
              collapsed && 'sr-only',
            )}
          >
            Theme
          </span>
          <div className={cn('flex items-center gap-1', collapsed && 'flex-col')}>
            <ThemeToggle />
          </div>
        </div>

        <AccountMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
