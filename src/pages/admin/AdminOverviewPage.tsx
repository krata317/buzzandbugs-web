import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, Users } from 'lucide-react';
import { useAdminOverview } from '@/features/admin/queries';
import { errorMessage } from '@/lib/api';
import { AdminHeader, StatCard } from './adminUi';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { Button, buttonStyles } from '@/components/ui/Button';

export function AdminOverviewPage() {
  const overview = useAdminOverview();

  if (overview.isLoading) {
    return (
      <div>
        <AdminHeader title="Overview" description="Platform activity at a glance." />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <div>
        <AdminHeader title="Overview" />
        <ErrorState
          title="Overview could not load"
          description={errorMessage(overview.error)}
          onRetry={() => void overview.refetch()}
        />
      </div>
    );
  }

  const data = overview.data;

  return (
    <div>
      <AdminHeader
        title="Overview"
        description="Counts refresh every minute. Nothing here is estimated."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<RefreshCw size={13} className={overview.isFetching ? 'animate-spin' : undefined} />}
            onClick={() => void overview.refetch()}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={data.users} hint={`${data.newUsersLast7Days} new in 7 days`} />
        <StatCard label="Posts" value={data.posts} hint={`${data.postsLast24Hours} in 24 hours`} />
        <StatCard label="Replies" value={data.replies} />
        <StatCard
          label="Reports reviewed"
          value={data.reportsReviewed}
          hint="reports attached to an appeal"
        />
        <StatCard
          label="Open appeals"
          value={data.openAppeals}
          hint="waiting on a decision"
          tone={data.openAppeals > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Banned users" value={data.bannedUsers} />
        <StatCard
          label="Pending deletions"
          value={data.pendingDeletions}
          tone={data.pendingDeletions > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/moderation"
          className="focus-ring group flex items-start gap-3 rounded-lg border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft"
        >
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-raised text-subtle">
            <ClipboardList size={15} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-ink group-hover:text-accent">
              Moderation queue
            </span>
            <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">
              {data.openAppeals} appeal{data.openAppeals === 1 ? '' : 's'} waiting for a decision.
              Automated checks that were accepted never reach this queue.
            </span>
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="focus-ring group flex items-start gap-3 rounded-lg border border-line bg-surface p-4 transition-[border-color,box-shadow] hover:border-lineStrong hover:shadow-soft"
        >
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-raised text-subtle">
            <Users size={15} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[13px] font-medium text-ink group-hover:text-accent">
              User lookup
            </span>
            <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">
              Search by username, display name or email to inspect warnings and bans.
            </span>
          </span>
        </Link>
      </div>

      <p className="mt-6 text-[11.5px] leading-relaxed text-subtle">
        Admin actions are written to the audit log with the acting admin id and the request IP.
      </p>

      <div className="mt-4">
        <Link to="/admin/audit" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          View audit log
        </Link>
      </div>
    </div>
  );
}
