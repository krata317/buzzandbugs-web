import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { LoadingBlock } from '@/components/ui/feedback';

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const BuzzPage = lazy(() =>
  import('@/pages/buzz/BuzzPage').then((module) => ({ default: module.BuzzPage })),
);
const PostPage = lazy(() =>
  import('@/pages/buzz/PostPage').then((module) => ({ default: module.PostPage })),
);
const NewsPage = lazy(() =>
  import('@/pages/news/NewsPage').then((module) => ({ default: module.NewsPage })),
);
const NewsSectionPage = lazy(() =>
  import('@/pages/news/NewsSectionPage').then((module) => ({
    default: module.NewsSectionPage,
  })),
);
const TrendingPage = lazy(() =>
  import('@/pages/trending/TrendingPage').then((module) => ({ default: module.TrendingPage })),
);
const TrendingSectionPage = lazy(() =>
  import('@/pages/trending/TrendingSectionPage').then((module) => ({
    default: module.TrendingSectionPage,
  })),
);
const EventsPage = lazy(() =>
  import('@/pages/events/EventsPage').then((module) => ({ default: module.EventsPage })),
);
const EventsSectionPage = lazy(() =>
  import('@/pages/events/EventsSectionPage').then((module) => ({
    default: module.EventsSectionPage,
  })),
);
const PodcastsPage = lazy(() =>
  import('@/pages/podcasts/PodcastsPage').then((module) => ({ default: module.PodcastsPage })),
);
const PodcastsSectionPage = lazy(() =>
  import('@/pages/podcasts/PodcastsSectionPage').then((module) => ({
    default: module.PodcastsSectionPage,
  })),
);
const TermsPage = lazy(() =>
  import('@/pages/legal/TermsPage').then((module) => ({ default: module.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/legal/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/NotificationsPage').then((module) => ({
    default: module.NotificationsPage,
  })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const SettingsLayout = lazy(() =>
  import('@/pages/settings/SettingsLayout').then((module) => ({ default: module.SettingsLayout })),
);
const AppearanceSettings = lazy(() =>
  import('@/pages/settings/AppearanceSettings').then((module) => ({
    default: module.AppearanceSettings,
  })),
);
const ProfileSettings = lazy(() =>
  import('@/pages/settings/ProfileSettings').then((module) => ({
    default: module.ProfileSettings,
  })),
);
const SectionsSettings = lazy(() =>
  import('@/pages/settings/SectionsSettings').then((module) => ({
    default: module.SectionsSettings,
  })),
);
const PrivacySettings = lazy(() =>
  import('@/pages/settings/PrivacySettings').then((module) => ({
    default: module.PrivacySettings,
  })),
);
const NotificationSettings = lazy(() =>
  import('@/pages/settings/NotificationSettings').then((module) => ({
    default: module.NotificationSettings,
  })),
);
const SessionSettings = lazy(() =>
  import('@/pages/settings/SessionSettings').then((module) => ({
    default: module.SessionSettings,
  })),
);
const AccountSettings = lazy(() =>
  import('@/pages/settings/AccountSettings').then((module) => ({
    default: module.AccountSettings,
  })),
);
const AppealPage = lazy(() =>
  import('@/pages/appeal/AppealPage').then((module) => ({ default: module.AppealPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);

const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })),
);
const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminOverviewPage = lazy(() =>
  import('@/pages/admin/AdminOverviewPage').then((module) => ({
    default: module.AdminOverviewPage,
  })),
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })),
);
const AdminUserPage = lazy(() =>
  import('@/pages/admin/AdminUserPage').then((module) => ({ default: module.AdminUserPage })),
);
const AdminModerationPage = lazy(() =>
  import('@/pages/admin/AdminModerationPage').then((module) => ({
    default: module.AdminModerationPage,
  })),
);
const AdminSourcesPage = lazy(() =>
  import('@/pages/admin/AdminSourcesPage').then((module) => ({
    default: module.AdminSourcesPage,
  })),
);
const AdminHealthPage = lazy(() =>
  import('@/pages/admin/AdminHealthPage').then((module) => ({ default: module.AdminHealthPage })),
);
const AdminJobsPage = lazy(() =>
  import('@/pages/admin/AdminJobsPage').then((module) => ({ default: module.AdminJobsPage })),
);
const AdminAuditPage = lazy(() =>
  import('@/pages/admin/AdminAuditPage').then((module) => ({ default: module.AdminAuditPage })),
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function Protected({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export default function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <ScrollToTop />
            <Suspense fallback={<LoadingBlock />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                </Route>

                <Route element={<AppShell />}>
                  <Route path="buzz" element={<BuzzPage />} />
                  <Route path="posts/:id" element={<PostPage />} />
                  <Route path="news" element={<NewsPage />} />
                  <Route path="news/:section" element={<NewsSectionPage />} />
                  <Route path="trending" element={<TrendingPage />} />
                  <Route path="trending/:section" element={<TrendingSectionPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="events/:section" element={<EventsSectionPage />} />
                  <Route path="podcasts" element={<PodcastsPage />} />
                  <Route path="podcasts/:section" element={<PodcastsSectionPage />} />
                  <Route path="users/:username" element={<ProfilePage />} />
                  <Route
                    path="notifications"
                    element={<Protected>{<NotificationsPage />}</Protected>}
                  />
                  <Route
                    path="settings"
                    element={
                      <Protected>
                        <SettingsLayout />
                      </Protected>
                    }
                  >
                    <Route index element={<AppearanceSettings />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="sections" element={<SectionsSettings />} />
                    <Route path="privacy" element={<PrivacySettings />} />
                    <Route path="notifications" element={<NotificationSettings />} />
                    <Route path="sessions" element={<SessionSettings />} />
                    <Route path="account" element={<AccountSettings />} />
                  </Route>
                </Route>

                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="appeals/:token" element={<AppealPage />} />

                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/:id" element={<AdminUserPage />} />
                  <Route path="moderation" element={<AdminModerationPage />} />
                  <Route path="sources" element={<AdminSourcesPage />} />
                  <Route path="health" element={<AdminHealthPage />} />
                  <Route path="jobs" element={<AdminJobsPage />} />
                  <Route path="audit" element={<AdminAuditPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
