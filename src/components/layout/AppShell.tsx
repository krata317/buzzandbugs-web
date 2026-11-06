import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTabBar, TopBar } from './TopBar';
import { RightRail } from './RightRail';
import { ConnectionBanner } from './ConnectionBanner';
import { useAuth } from '@/providers/AuthProvider';
import { AccountHoldPage } from '@/pages/account/AccountHoldPage';

const SIDEBAR_KEY = 'bnb.sidebar.v1';

export function AppShell() {
  const { pendingDeletion } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* preference is not essential */
    }
  }, [collapsed]);

  if (pendingDeletion) {
    return <AccountHoldPage scheduledFor={pendingDeletion.scheduledFor} />;
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-lift"
      >
        Skip to content
      </a>

      <ConnectionBanner />
      <TopBar />

      <div className="mx-auto flex w-full max-w-[1440px]">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="flex min-w-0 flex-1">
          <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-16">
            <div className="mx-auto w-full max-w-[780px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <div key={location.pathname} className="page-enter">
                <Outlet />
              </div>
            </div>
          </main>
          <RightRail />
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
