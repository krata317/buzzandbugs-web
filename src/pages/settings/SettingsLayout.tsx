import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  Blocks,
  LayoutList,
  Palette,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/ui/nav';

const SETTINGS_NAV = [
  { to: '/settings', label: 'Appearance', icon: Palette, end: true },
  { to: '/settings/profile', label: 'Profile', icon: UserCog, end: false },
  { to: '/settings/sections', label: 'Sections', icon: LayoutList, end: false },
  { to: '/settings/privacy', label: 'Privacy', icon: ShieldCheck, end: false },
  { to: '/settings/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/settings/sessions', label: 'Sessions', icon: Users, end: false },
  { to: '/settings/account', label: 'Account', icon: Blocks, end: false },
];

export function SettingsLayout() {
  useDocumentTitle('Settings');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Appearance, profile, section order, privacy and account security."
      />

      <div className="grid gap-6 md:grid-cols-[176px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 no-scrollbar md:mx-0 md:sticky md:top-6 md:h-fit md:flex-col md:overflow-visible md:px-0 md:pb-0"
        >
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-raised text-ink'
                      : 'text-muted hover:bg-raised/60 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
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

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  footer,
  tone = 'default',
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <section
      className={cn(
        'card overflow-hidden',
        tone === 'danger' && 'border-danger/30',
      )}
    >
      <div className="border-b border-line px-4 py-3.5 sm:px-5">
        <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      <div className="px-4 py-4 sm:px-5">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-raised/40 px-4 py-3 sm:px-5">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function SaveIndicator({
  saving,
  saved,
  error,
}: {
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
}) {
  if (error) {
    return <span className="text-[11.5px] text-danger">{error}</span>;
  }
  if (saving) {
    return <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-subtle">Saving…</span>;
  }
  if (saved) {
    return <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-accent">Saved</span>;
  }
  return null;
}
