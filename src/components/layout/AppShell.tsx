import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTabBar, TopBar } from './TopBar';
import { RightRail } from './RightRail';
import { ConnectionBanner } from './ConnectionBanner';

const SIDEBAR_KEY = 'bnb.sidebar.v1';

export function AppShell() {
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

      <div className="mx-auto flex w-full max-w-[1400px]">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="flex min-w-0 flex-1">
          <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-14">
            <div className="mx-auto w-full max-w-[752px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
              <Outlet />
            </div>
          </main>
          <RightRail />
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
