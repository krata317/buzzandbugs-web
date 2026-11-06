import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ClipboardList,
  Database,
  Gauge,
  ListChecks,
  LogOut,
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdminMe } from '@/features/admin/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/feedback';
import { ConnectionBanner } from '@/components/layout/ConnectionBanner';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: Gauge, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/moderation', label: 'Moderation', icon: ClipboardList, end: false },
  { to: '/admin/sources', label: 'Sources', icon: Radio, end: false },
  { to: '/admin/health', label: 'Health', icon: Activity, end: false },
  { to: '/admin/jobs', label: 'Jobs', icon: ListChecks, end: false },
  { to: '/admin/audit', label: 'Audit log', icon: Database, end: false },
];

export function AdminLayout() {
  useDocumentTitle('Admin');
  const me = useAdminMe();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (me.isLoading) return <LoadingBlock label="Checking admin session" />;

  if (me.isError || !me.data) {
    return <Navigate to="/admin/login" replace />;
  }

  const signOut = async () => {
    try {
      await adminApi.logout();
    } catch {
      // The session may already be gone; continue signing out locally.
    }
    queryClient.removeQueries({ queryKey: ['admin'] });
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-20%,rgb(var(--accent)/0.06),transparent_60%)]">
      <ConnectionBanner />

      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center gap-3 px-4 sm:px-6">
          <Logo />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent">
            <ShieldCheck size={10} aria-hidden="true" />
            Admin
          </span>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle sm:inline">
              {me.data.username}
            </span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<LogOut size={13} />}
              onClick={() => void signOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        />
      </header>

      <div className="mx-auto flex w-full max-w-[1360px] gap-8 px-4 py-7 sm:px-6">
        <nav
          aria-label="Admin sections"
          className="sticky top-24 hidden h-fit w-[184px] shrink-0 flex-col gap-0.5 md:flex"
        >
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-accent/[0.10] text-ink shadow-soft'
                      : 'text-muted hover:bg-raised/70 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={14}
                      className={isActive ? 'text-accent' : 'text-subtle'}
                      aria-hidden="true"
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Admin sections"
            className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar md:hidden"
          >
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn('chip shrink-0', isActive && 'border-accent/30 bg-accent/10 text-accent')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
